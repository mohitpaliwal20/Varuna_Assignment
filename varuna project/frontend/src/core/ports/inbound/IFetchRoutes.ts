import { Route } from '../../domain';

export interface IFetchRoutes {
  execute(): Promise<Route[]>;
}
