import json
from collections import defaultdict
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data" / "products.json"


def main() -> None:
    items = json.loads(DATA.read_text(encoding="utf-8"))
    groups = defaultdict(list)
    for item in items:
        groups[item["category"]].append(item["price"])

    print(f"{len(items)} products\n")
    print(f"{'Category':<12}{'Count':>6}{'Average':>10}{'Highest':>10}")
    for cat in sorted(groups):
        prices = groups[cat]
        print(f"{cat:<12}{len(prices):>6}{sum(prices) / len(prices):>10,.0f}{max(prices):>10,}")

    print("\nBy price, high to low:")
    for item in sorted(items, key=lambda p: (-p["price"], p["name"])):
        print(f"  {item['name']:<20} ${item['price']:,}")


if __name__ == "__main__":
    main()
