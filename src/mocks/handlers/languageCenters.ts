import { getDemoCentreConfiguration } from "features/universities/language-centers/fixtures/demoData";
import { mock, httpError } from "../router";
import { newId, seedId, table } from "../db";
import { universities } from "./universities";
import {
  validateLanguageCenter,
  type LanguageCenter,
  type LanguageCenterInput,
} from "features/universities/language-centers/types";

const centers = table<LanguageCenter>(
  universities
    .all()
    .filter((university) => university.has_language_center)
    .map((university, index) => {
      const demo = getDemoCentreConfiguration(university.id);
      return {
        id: seedId("lc", index + 1),
        university_id: university.id,
        name: demo?.name || `${university.name} Language Center`,
        location: demo?.location || university.country,
        email: demo?.email || "",
        phone: demo?.phone || "",
        description: demo?.description || "",
        is_active: university.is_active,
      };
    })
);
function syncUniversity(id: string) {
  universities.update(id, {
    has_language_center: centers
      .all()
      .some((center) => center.university_id === id),
  });
}
function validate(body: LanguageCenterInput) {
  if (
    !body ||
    typeof body.name !== "string" ||
    typeof body.location !== "string" ||
    typeof body.email !== "string" ||
    typeof body.phone !== "string" ||
    typeof body.description !== "string" ||
    typeof body.is_active !== "boolean"
  )
    return httpError(422, "Complete the language center details.");
  const errors = validateLanguageCenter(body);
  if (Object.keys(errors).length)
    return httpError(422, Object.values(errors)[0]);
  if (!universities.find(body.university_id))
    return httpError(422, "Choose an existing university.");
}
const path = "/knowledge-hub/language-centers";
mock.get(path, () => ({
  items: centers.all().map((center) => ({ ...center })),
}));
mock.post(path, ({ body }) => {
  const error = validate(body);
  if (error) return error;
  const center = centers.insert({
    id: newId("lc"),
    university_id: body.university_id,
    name: body.name.trim(),
    location: body.location.trim(),
    email: body.email.trim(),
    phone: body.phone.trim(),
    description: body.description.trim(),
    is_active: body.is_active,
  });
  syncUniversity(center.university_id);
  return { ...center };
});
mock.put(`${path}/:id`, ({ params, body }) => {
  const previous = centers.find(params.id);
  if (!previous) return httpError(404, "Language center not found.");
  const error = validate(body);
  if (error) return error;
  const oldUniversity = previous.university_id;
  const center = centers.update(params.id, {
    university_id: body.university_id,
    name: body.name.trim(),
    location: body.location.trim(),
    email: body.email.trim(),
    phone: body.phone.trim(),
    description: body.description.trim(),
    is_active: body.is_active,
  });
  syncUniversity(oldUniversity);
  syncUniversity(center.university_id);
  return { ...center };
});
mock.delete(`${path}/:id`, ({ params }) => {
  const center = centers.find(params.id);
  if (!center) return httpError(404, "Language center not found.");
  centers.remove(params.id);
  syncUniversity(center.university_id);
  return { success: true };
});
