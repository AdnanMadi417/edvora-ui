import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  FileUpload,
  validateFile,
} from "components/ub/forms/uploads/FileUpload";

const makeFile = (name: string, sizeMb: number, type: string) => {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: sizeMb * 1024 * 1024 });
  return file;
};

describe("FileUpload", () => {
  it("rejects files over the limit with a message that says how to fix it", () => {
    const onSelect = jest.fn();
    const onError = jest.fn();
    const { container } = render(
      <FileUpload
        label="Passport"
        accept={[".pdf"]}
        maxSizeMb={10}
        files={[]}
        onSelect={onSelect}
        onError={onError}
      />
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: {
        files: [makeFile("passport-nur-aisyah.pdf", 12, "application/pdf")],
      },
    });

    expect(
      screen.getByText("This file is over 10 MB. Upload a PDF under 10 MB.")
    ).toBeInTheDocument();
    expect(onError).toHaveBeenLastCalledWith(
      "This file is over 10 MB. Upload a PDF under 10 MB."
    );
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.change(input, {
      target: {
        files: [makeFile("passport-nur-aisyah.pdf", 2, "application/pdf")],
      },
    });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/over 10 MB/)).not.toBeInTheDocument();
  });

  it("names the allowed types when the type is wrong", () => {
    expect(
      validateFile(makeFile("offer.docx", 1, ""), {
        accept: [".pdf", ".jpg", ".png"],
      })
    ).toBe("This file type isn't supported. Upload a PDF, JPG or PNG.");
    expect(
      validateFile(makeFile("offer.png", 11, "image/png"), {
        accept: [".pdf", ".png"],
      })
    ).toBe("This file is over 10 MB. Upload a file under 10 MB.");
  });

  it("renders row states from props", () => {
    render(
      <FileUpload
        label="Supporting documents"
        multiple
        files={[
          {
            id: "a",
            name: "transcript.pdf",
            status: "uploading",
            progress: 40,
          },
          {
            id: "b",
            name: "passport.pdf",
            status: "verified",
            size: 2_400_000,
          },
          {
            id: "c",
            name: "photo.jpg",
            status: "needs-replacing",
            reason: "The photo is blurry. Upload a sharper scan.",
          },
        ]}
        onSelect={() => {}}
      />
    );
    expect(
      screen.getByRole("progressbar", { name: "Uploading transcript.pdf" })
    ).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("Needs replacing")).toBeInTheDocument();
    expect(
      screen.getByText("The photo is blurry. Upload a sharper scan.")
    ).toBeInTheDocument();
  });
});
