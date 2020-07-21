module.exports = function (number) {

    // if dont have cuntry code add poland code
    if (!number.includes("+"))
        number = '+48' + number;
    else
        number = number.substr(3);
        
    return number;
}