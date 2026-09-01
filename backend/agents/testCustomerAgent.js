const analyzeCustomer =
    require("./customerIntelligenceAgent");


const customer = {

    customer_id: "CUST_00001",

    total_transactions: 18,

    successful_transactions: 16,

    failed_transactions: 2,

    preferred_payment_method: "UPI",

    total_spend: 85000

};


const result =
    analyzeCustomer(customer);


console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);