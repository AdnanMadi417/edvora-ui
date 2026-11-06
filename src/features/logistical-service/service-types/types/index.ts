export interface LogisticService {
  id: string;
  name: string;
}

export type LogisticServices = LogisticService[];

export interface CreateLogisticServicePayload {
  name: string;
}

export interface EditLogisticServicePayload {
  name: string;
}
