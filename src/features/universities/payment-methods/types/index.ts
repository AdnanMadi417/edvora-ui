export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
}
export interface PaymentMethodPayload {
  name: string;
  description: string;
}
export interface BatchAssignPayload {
  payment_method_ids: string[];
  university_ids: string[];
  instructions?: string;
  currency?: string;
  is_active?: boolean;
}
