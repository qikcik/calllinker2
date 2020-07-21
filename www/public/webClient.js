let extension = localStorage['extension'];
if(!extension)
{
    extension = prompt("Podaj numer stanowiska", "");
    localStorage['extension'] = extension;
}



let socket = io.connect( window.location.host );

let connectedWith = '';

socket.on( 'connect', () => {
    console.log( 'connected to server' );
    socket.emit('login',extension);
});
socket.on('reconnecting', () => {
    location.reload();
});


socket.on("logged", (result) => {
    extension = result;
    document.getElementById("oncall-general-extension").innerHTML = result;
    //alert(`połączono do stanowiska ${extension}`);
});

socket.on("inCall", (result) => {
    connectedWith = result;
    document.getElementById("oncall-general-caller").innerHTML = result;
    document.getElementById("oncall-orders").innerHTML = "";
    /*document.getElementById("oncall-orders").innerHTML = "";
    for (i in result.orders) {
        let order = result.orders[i];
        document.getElementById("oncall-orders").innerHTML += 
        `
            <div class="oncall-order" >
                <div style="padding:15px">
                    <div class="field">
                            <div class="label">id:</div> 
                            <div id="oncall-general-extension" class="property">${order._id}</div>
                    </div>
                    <div class="field">
                            <div class="label">data zamówienia:</div> 
                            <div id="oncall-general-extension" class="property">${timeConverter(order.date_add)}</div>
                    </div>
                    <div class="field">
                            <div class="label">potwierdzona:</div> 
                            <div id="oncall-general-extension" class="property">${order.confirmed ? 'tak': 'nie'}</div>
                    </div>
                </div>
                <div class="field" style="justify-content: right;">
                    <a href="https://panel.baselinker.com/orders.php#order:${order._id}">otwórz</a>
                </div>
            </div>
        `;
    }*/

});

socket.on("orders", (result) => {
    if(result.extension == connectedWith )
    {
        document.getElementById("oncall-orders").innerHTML = "";
        for (i in result.orders) {
            let order = result.orders[i];
            document.getElementById("oncall-orders").innerHTML += 
            `
                <div class="oncall-order" >
                    <div style="padding:15px">
                        <div class="field">
                                <div class="label">id:</div> 
                                <div id="oncall-general-extension" class="property">${order.order_id}</div>
                        </div>
                        <div class="field">
                                <div class="label">data zamówienia:</div> 
                                <div id="oncall-general-extension" class="property">${timeConverter(order.date_add)}</div>
                        </div>
                        <div class="field">
                                <div class="label">potwierdzona:</div> 
                                <div id="oncall-general-extension" class="property">${order.confirmed ? 'tak': 'nie'}</div>
                        </div>
                    </div>
                    <div class="field" style="justify-content: right;">
                        <a href="https://panel.baselinker.com/orders.php#order:${order.order_id}">otwórz</a>
                    </div>
                </div>
            `;
        }
    }

});

socket.on("hangup", (result) => {
    connectedWith = '';
    document.getElementById("oncall-general-caller").innerHTML = "";
    document.getElementById("oncall-orders").innerHTML = "";
});

socket.on("error", (result) => {
    console.log(error);
});









// utils

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['STY', 'LUT', 'MAR', 'KWI', 'MAJ', 'CZE', 'LIP', 'SIE', 'WRZ', 'PAŹ', 'LIS', 'GRU'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

function logout()
{
    localStorage['extension'] = '';
    location.reload();
}