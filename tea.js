// My implementation of Tiny Encryption Algorithm

let strToInt32s = input => {
    let int16s = input.split("").map(chr => chr.charCodeAt())
    var L = Math.ceil(int16s.length / 2)
    var int32s = new Uint32Array(L + (L % 2))
    for (var i = 0; i < int32s.length; i+=1) {
        int32s[i] = ((int16s[i*2] || 0) << 16) + (int16s[(i*2)+1] || 0);
    }
    return int32s
} 

let int32sToStr = int32s => int32s
    .reduce((acc, n) => acc + 
        String.fromCharCode(n >> 16) + 
        String.fromCharCode(((1 << 16)-1) & n), 
        "");

function encBlocks (v0, v1, k0, k1, k2, k3, k4){
    var sum = 0;
    let delta = 0x9e3779b9;
    for (var i = 0; i < 32; i++) {
        sum += delta;
        v0 += ((v1 << 4) + k0) ^ (v1 + sum) ^ ((v1 >> 5) + k1);
        v1 += ((v0 << 4) + k2) ^ (v0 + sum) ^ ((v0 >> 5) + k3);
    }
    return [v0, v1];
}

function enc(input, password) {
    let v = strToInt32s(input);
    let k = strToInt32s(password);
    var cipher = [];
    for (var i = 0; i < v.length; i += 2) {
        cipher.push.apply(cipher, encBlocks(v[i], v[i+1], k[0], k[1], k[2], k[3]))
    }
    return cipher.map(i => i >>> 0)
}

function decBlocks(v0, v1, k0, k1, k2, k3, k4) {
    let sum = 0xC6EF3720;
    let delta = 0x9e3779b9;
    for (var i = 0; i < 32; i++) {                              
        v1 -= ((v0 << 4) + k2) ^ (v0 + sum) ^ ((v0 >> 5) + k3);
        v0 -= ((v1 << 4) + k0) ^ (v1 + sum) ^ ((v1 >> 5) + k1);
        sum -= delta;                                   
    }
    return [v0, v1]
}

function dec(v, password) {
    let k = strToInt32s(password);
    var clean = [];
    for (var i = 0; i < v.length; i += 2) {
        clean.push.apply(clean, decBlocks(v[i], v[i+1], k[0], k[1], k[2], k[3]))
    }
    while (clean[clean.length-1] == 0) clean.pop(); // unpadding
    return int32sToStr(clean)
}
