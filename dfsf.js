function string(lar, sm) {
    var count = 0;
    for (let i = 0; i < lar.length; i++) {
        for (let z = 0; z < sm.length; z++) {
            if (sm[z] !== lar[i + z]) {
                break;
            }
            if (z === sm.length - 1) {
                count++
            }
        }
    }
    return count;
}
string("asbndjfhf", "bn")