function lengthSorter(arr) {
  return arr.sort((a, b) => {
    if (b.length !== a.length) {
      return b.length - a.length;
    }
    return a < b ? -1 : a > b ? 1 : 0;
  });
}
