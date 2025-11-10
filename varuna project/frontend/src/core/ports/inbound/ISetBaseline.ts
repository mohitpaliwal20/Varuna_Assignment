export interface ISetBaseline {
  execute(routeId: string): Promise<void>;
}
