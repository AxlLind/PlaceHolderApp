
const config = {
    server: 'http://192.168.176.197:3000',
    errUptime: 2000, // ms
};

const codes = {
    fetchErr: -1,
    success: 0,
    server: 1,
    invalidAuth: 2,
    invalidParam: 3,
    missingParam: 4,
    invalidEndpoint: 5,
};

export {
    config,
    codes,
}
