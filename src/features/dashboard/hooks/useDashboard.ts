import { useResource } from '../../../hooks/useResource'
import { dashboardService } from '../services/dashboardService'
export function useDashboard() { return useResource(dashboardService.get) }
