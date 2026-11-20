import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class WaitlistStats {
    public static void main(String[] args) throws IOException {
        Path file = Path.of(args.length > 0 ? args[0] : "data/waitlist.csv");
        if (!Files.exists(file)) {
            System.out.println("No signups yet.");
            return;
        }
        List<String> emails;
        try (Stream<String> lines = Files.lines(file)) {
            emails = lines.map(String::trim)
                    .filter(l -> !l.isEmpty())
                    .map(l -> l.split(",", 2)[0])
                    .filter(e -> e.contains("@"))
                    .collect(Collectors.toList());
        }
        Map<String, Long> byDomain = emails.stream().collect(
                Collectors.groupingBy(e -> e.substring(e.indexOf('@') + 1), TreeMap::new, Collectors.counting()));

        System.out.println(emails.size() + " signups");
        byDomain.entrySet().stream()
                .sorted((a, b) -> {
                    int c = Long.compare(b.getValue(), a.getValue());
                    return c != 0 ? c : a.getKey().compareTo(b.getKey());
                })
                .forEach(e -> System.out.printf("  %-24s %d%n", e.getKey(), e.getValue()));
    }
}
