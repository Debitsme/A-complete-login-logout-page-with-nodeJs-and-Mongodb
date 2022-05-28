function run(arr) {
    for (let i = 1; i < arr.length; i++) {
        var seco = arr[i];
        for (var j = i - 1; j >= 0 && arr[j] > seco; j--) {
            arr[j + 1] = arr[j]
        }
        arr[j + 1] = seco
    }
    return arr

}

run([33, 24, 5, 6, 7, 88])