module.exports = function (number) {
    // remove whitespace
    number = number.replace(/ /gi, '');
    // remove (-)
    number = number.replace(/-/gi, '');

    // if dont have cuntry code add poland code
    //if (!number.includes("+"))
    //    number = '+48' + number;
    //if (number.includes("+"))
    //    number = number.substr(3);

    return number;
}