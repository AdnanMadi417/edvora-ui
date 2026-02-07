import React from "react";

const CheckBoxGroup = ({
                         label,
                         field,
                         options, // array of {id, name}
                         formData,
                         updateFormData,
                         errors,
                         required = false
                       }) => {

  // helper to check if an id is already selected
  const isSelected = (id) => {
    const selected = formData[field] || [];
    return selected.includes(id);
  }

  const toggleSelection = (id) => {
    const selected = formData[field] || [];
    let newSelected;
    if (selected.includes(id)) {
      newSelected = selected.filter((i) => i !== id);
    } else {
      newSelected = [...selected, id];
    }
    updateFormData(field, newSelected);
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-900 mb-2">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {options.map((option) => (
          <label key={option.id} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected(option.id)}
              onChange={() => toggleSelection(option.id)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-800">{option.name}</span>
          </label>
        ))}
      </div>

      {errors && errors[field] && (
        <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
      )}
    </div>
  )
}

export default CheckBoxGroup;
