export type Transaction = {
  id: string;
  dateCreated: Date;
  dateUpdated: Date;
  departmentId: string;
  name: string;
  code: string;
  supervisorId: string | null;
};
