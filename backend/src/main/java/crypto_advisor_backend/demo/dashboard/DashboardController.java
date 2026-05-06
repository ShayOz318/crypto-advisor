package crypto_advisor_backend.demo.dashboard;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse getDashboard(
            @RequestHeader("Authorization") String authHeader) {
        return dashboardService.getDashboard(authHeader);
    }

    @GetMapping("/coin-chart")
    public List<CoinChartPoint> getCoinChart(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String symbol) {
        return dashboardService.getCoinWeeklyChart(authHeader, symbol);
    }
}