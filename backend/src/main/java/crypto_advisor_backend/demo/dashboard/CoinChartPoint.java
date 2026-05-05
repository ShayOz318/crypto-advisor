package crypto_advisor_backend.demo.dashboard;

public class CoinChartPoint {

    private String date;
    private double price;

    public CoinChartPoint(String date, double price) {
        this.date = date;
        this.price = price;
    }

    public String getDate() {
        return date;
    }

    public double getPrice() {
        return price;
    }
}
