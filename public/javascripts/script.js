$(document).ready(function(){
    var orderDetails = [];
    console.log('script.js');
    var cartVal = 0;
    console.log("_______avlStock______");
    $('p.avlStock').each(function(){
        console.log($(this).text())
        if($(this).text() == 0 ){
            $(this).siblings('button.addIteminCartBtn').attr("disabled", "disabled");
        }
    });

    // .addIteminCartBtn
    $('.addIteminCartBtn').on('click', function(){
        console.log($(this))
        var productId = $(this).siblings('p.productId').text();
        var productName = $(this).siblings('p.prodName').text();
        var productCost = $(this).siblings('p.cost').text();
        var avlStock = $(this).siblings('p.avlStock');
        console.log( productId );
        // check if stock in avilable, disable the button if not
        if(avlStock.text() == 0){
            console.log('disabled true')
            $(this).attr("disabled", "disabled");
            return false;
        }
        // add value in cart
        cartVal++;
        $('.cartVal').text(cartVal);
        console.log("cartVal- " + cartVal);

        // create ordered list in array

        var stuff = { productId : productId,
                        prodName: productName,
                        avlStock: avlStock.text(),
                        productCost: productCost
                    };
        orderDetails.push(stuff);
        console.log('_________orderDetails array');
        console.log(orderDetails);

        $.ajax({
            url: '/dashboard/addCart',
            method : 'GET',
            data: {productId : productId },
            success: function(response){
                console.log(response[0].available_quantity); 
                avlStock.text(response[0].available_quantity);
            }
        });
    });  // .addIteminCartBtn end here

    
    $('.cartBtn').on('click', function(){
        $.ajax({
            url:'/dashboard/checkout',
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({orderDetails : orderDetails }),
            success: function(response){
                console.log(response);
                if(response === 'No item in cart'){
                    console.log('if true');
                    $('span.msg').show();
                    $('span.msg').show().text(response);
                    setTimeout(function(){
                        $('span.msg').hide();
                    },3000)
                } else {
                        console.log('response else');
                        if(typeof response.redirect == 'string')
                            window.location = response.redirect;
                      /*  $('div.afterCheckout').show();
                        var tbodyEl = $('table tbody');
                        tbodyEl.html('');
                        var totalPay=0;
                        response.forEach(element => {
                            totalPay += element.total_cost
                            console.log(element)  ;  
                            tbodyEl.append(`
                            <tr>
                            <td>`+ element.pname +`</td>
                            <td>`+ element.quantity +`</td>
                            <td>`+ element.total_cost +`</td>
                            </tr>
                            `);
                        });
                        tbodyEl.append(`
                        <tr>
                            <td colspan=2><strong>Total</strong></td>
                            <td><strong>`+ totalPay +`</strong></td>
                        </tr>
                        `); */
                } // else ends here
            }  // success block ends here
        })
    })
})