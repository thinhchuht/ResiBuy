import { X,  Store as StoreIcon, Mail, Phone, MapPin, Info, Image, ToggleLeft } from "lucide-react";
import { useEffect } from "react";
import { Area, RText, Yard, Core, Container } from "../../../lib/by/Div";
import { useStoreForm } from "../../../components/admin/Store/seg/utlis";
import { type Store } from "../../../types/models";

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (store: Store) => void;
  editStore?: Store | null;
}

export function AddStoreModal({
  isOpen,
  onClose,
  onSubmit,
  editStore,
}: AddStoreModalProps) {
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit } =
    useStoreForm(editStore);

  // Reset form when editStore changes
  useEffect(() => {
    if (editStore) {
      Object.entries(formData).forEach(([key, _]) => {
        handleInputChange(key, editStore[key as keyof Store] || "");
      });
    }
  }, [editStore]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <Core
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[9998] ${
          isOpen ? "bg-opacity-60" : "bg-opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <Core
        className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Container className="h-full overflow-y-auto">
          {/* Header */}
          <Area className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <Yard>
              <RText className="text-xl font-semibold text-gray-900">
                {editStore ? "Edit Store" : "Add New Store"}
              </RText>
              <RText className="text-sm text-gray-500">
                {editStore
                  ? "Update store information"
                  : "Create a new store"}
              </RText>
            </Yard>
            <button
              onClick={onClose}
              className="text-gray-400 bg-white hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </Area>

          {/* Form */}
          <form
            onSubmit={(e) => handleSubmit(e, onSubmit)}
            className="p-6 space-y-6"
          >
            {/* Basic Information */}
            <Yard>
              <RText className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <StoreIcon className="w-5 h-5" />
                Basic Information
              </RText>

              <Area className="space-y-4">
                {/* Store Name */}
                <Yard>
                  <RText className="block text-sm font-medium  text-gray-700 mb-2">
                    Store Name *
                  </RText>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter store name"
                    className={`w-full px-3 py-2 border text-gray-400 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <RText className="text-red-500 text-sm mt-1">
                      {errors.name}
                    </RText>
                  )}
                </Yard>

                {/* Email and Phone */}
                <Area className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Yard>
                    <RText className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email Address *
                    </RText>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="store@email.com"
                      className={`w-full  bg-white  text-gray-400 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.email && (
                      <RText className="text-red-500  text-sm mt-1">
                        {errors.email}
                      </RText>
                    )}
                  </Yard>

                  <Yard>
                    <RText className="block  text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Phone Number *
                    </RText>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                      className={`w-full px-3  text-gray-400 bg-white py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.phoneNumber ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.phoneNumber && (
                      <RText className="text-red-500 text-sm mt-1">
                        {errors.phoneNumber}
                      </RText>
                    )}
                  </Yard>
                </Area>

                {/* Address */}
                <Yard>
                  <RText className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Address *
                  </RText>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter full address"
                    rows={3}
                    className={`w-full px-3 py-2 border  text-gray-400  bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.address && (
                    <RText className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </RText>
                  )}
                </Yard>
              </Area>
            </Yard>

            {/* Store Settings */}
            <Yard>
              <RText className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Store Settings
              </RText>

              <Area className="space-y-4">
                {/* Description */}
                <Yard>
                  <RText className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </RText>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter store description"
                    rows={3}
                    className="w-full  text-gray-400 bg-white px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <RText className="text-xs text-gray-500 mt-1">
                    Optional: Brief description of the store
                  </RText>
                </Yard>

                {/* Image URL */}
                <Yard>
                  <RText className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Image className="w-4 h-4" />
                    Image URL
                  </RText>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      handleInputChange("imageUrl", e.target.value)
                    }
                    placeholder="https://i.pinimg.com/736x/90/f5/e8/90f5e8e204285e82595db00595f388f4.jpg"
                    className="w-full px-3  text-gray-400 bg-white py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <RText className="text-xs text-gray-500 mt-1">
                    Optional: URL to store image
                  </RText>
                </Yard>

                {/* Active Status */}
                <Yard>
                  <RText className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <ToggleLeft className="w-4 h-4" />
                    Active Status
                  </RText>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        handleInputChange("isActive", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <RText className="text-sm text-gray-700">
                      Store is active
                    </RText>
                  </label>
                  <RText className="text-xs text-gray-500 mt-1">
                    Enable or disable store visibility
                  </RText>
                </Yard>
              </Area>
            </Yard>

            {/* Actions */}
            <Area className="flex justify-end space-x-3 pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting
                  ? "Saving..."
                  : editStore
                    ? "Update Store"
                    : "Add Store"}
              </button>
            </Area>
          </form>
        </Container>
      </Core>
    </>
  );
}