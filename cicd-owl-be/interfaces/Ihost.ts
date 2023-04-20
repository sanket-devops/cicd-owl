import { ICore } from "./Icore";

export interface Ihost extends ICore {
  hostName: string;
  hostAdd: string;
  hostPort: number;
  hostUser: string;
  hostPass: string;
  hostPath: string;
}
