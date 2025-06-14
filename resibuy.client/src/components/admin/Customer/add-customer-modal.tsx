

import { X, User, Mail, Phone, MapPin, Star, Trophy } from "lucide-react";
import { useEffect } from "react";
import { Area, RText, Yard, Core, Container } from "../../../lib/by/Div";
import {
  customerStatusOptions,
  loyaltyTierOptions,
} from "../../../constants/manage-customers/index";
import { useCustomerForm } from "../../../components/admin/Customer/seg/utils";
import { type Customer } from "../../../constants/manage-customers/index";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: Customer) => void;
  editCustomer?: Customer | null;
}

export function AddCustomerModal({
  isOpen,
  onClose,
  onSubmit,
  editCustomer,
}: AddCustomerModalProps) {
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit } =
    useCustomerForm(editCustomer);

  // Reset form when editCustomer changes
  useEffect(() => {
    if (editCustomer) {
      Object.entries(editCustomer).forEach(([key, value]) => {
        if (key === "gameScore") {
          handleInputChange(key, value.toString());
        } else {
          handleInputChange(key, value);
        }
      });
    }
  }, [editCustomer]);

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
                {editCustomer ? "Edit Customer" : "Add New Customer"}
              </RText>
              <RText className="text-sm text-gray-500">
                {editCustomer
                  ? "Update customer information"
                  : "Create a new customer account"}
              </RText>
            </Yard>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                <User className="w-5 h-5" />
                Basic Information
              </RText>

              <Area className="space-y-4">
                {/* Customer Name */}
                <Yard>
                  <RText className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </RText>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter customer full name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
                      placeholder="customer@email.com"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.email && (
                      <RText className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </RText>
                    )}
                  </Yard>

                  <Yard>
                    <RText className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Phone Number *
                    </RText>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.phone && (
                      <RText className="text-red-500 text-sm mt-1">
                        {errors.phone}
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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

            {/* Account Settings */}
            <Yard>
              <RText className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Account Settings
              </RText>

              <Area className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <Yard>
                  <RText className="block text-sm font-medium text-gray-700 mb-2">
                    Account Status
                  </RText>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {customerStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Yard>

                {/* Loyalty Tier */}
                <Yard>
                  <RText className="block text-sm font-medium text-gray-700 mb-2">
                    Loyalty Tier
                  </RText>
                  <select
                    value={formData.loyaltyTier}
                    onChange={(e) =>
                      handleInputChange("loyaltyTier", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {loyaltyTierOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Yard>
              </Area>
            </Yard>

            {/* Game Score */}
            <Yard>
              <RText className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Game Score
              </RText>

              <Yard>
                <RText className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Game Score
                </RText>
                <input
                  type="number"
                  min="0"
                  value={formData.gameScore}
                  onChange={(e) =>
                    handleInputChange("gameScore", e.target.value)
                  }
                  placeholder="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.gameScore ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.gameScore && (
                  <RText className="text-red-500 text-sm mt-1">
                    {errors.gameScore}
                  </RText>
                )}
                <RText className="text-xs text-gray-500 mt-1">
                  Points earned through games and activities
                </RText>
              </Yard>
            </Yard>

            {/* Notes */}
            <Yard>
              <RText className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </RText>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add any additional notes about this customer..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <RText className="text-xs text-gray-500 mt-1">
                Optional: Special preferences, VIP status, etc.
              </RText>
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
                  : editCustomer
                    ? "Update Customer"
                    : "Add Customer"}
              </button>
            </Area>
          </form>
        </Container>
      </Core>
    </>
  );
}
