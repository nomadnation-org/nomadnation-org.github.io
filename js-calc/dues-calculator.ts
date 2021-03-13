//TODO: Wechselkurse dynamisch laden (einmalig)

let EXCHANGE_RATIOS = [0.51125, 1.0, 0.43901, 0.61071] // In der Reihenfolge der Currencies, https://themoneyconverter.com/BGN/EUR
let SOCIAL_SEC_EMPLOYEE_PCT = 0.1378;
let SOCIAL_SEC_EMPLOYER_PCT = 0.1892;
let TAX_PCT = 0.1000;
let MAX_SOCIAL_SEC_INCOME_BGN = 3000.00;

function onInteraction(view:View) {
    let model = view.Model;

    model.ExchangeRatio = EXCHANGE_RATIOS[model.Currency];

    let socialSecurityShares:SocialSecurityShares;

    if (model.IncomeGivenType == IncomeTypes.Total) {
        model.GrossIncome = model.IncomeGiven / (1 + SOCIAL_SEC_EMPLOYER_PCT);
        socialSecurityShares = CalculateSocialSecurity(model.GrossIncome, model.ExchangeRatio);
        model.GrossIncome = model.IncomeGiven - socialSecurityShares.Employer;
    }
    else if (model.IncomeGivenType == IncomeTypes.Net) {
        let taxableIncome = model.IncomeGiven / (1-TAX_PCT);
        model.GrossIncome = taxableIncome / (1-SOCIAL_SEC_EMPLOYEE_PCT);
        socialSecurityShares = CalculateSocialSecurity(model.GrossIncome, model.ExchangeRatio);
        model.GrossIncome = taxableIncome + socialSecurityShares.Employee;
    }
    else {
        model.GrossIncome = model.IncomeGiven;
        socialSecurityShares = CalculateSocialSecurity(model.GrossIncome, model.ExchangeRatio);
    }

    model.TotalSocialSec = socialSecurityShares.Total;
    model.TotalCostOfIncome = model.GrossIncome + socialSecurityShares.Employer;

    let taxableIncome = model.GrossIncome - socialSecurityShares.Employee;
    model.TotalTaxes = taxableIncome * TAX_PCT;
    model.NetIncome = taxableIncome - model.TotalTaxes;

    view.Update(model);
}

class SocialSecurityShares {
    public Employee:number;
    public Employer:number;

    public get Total() {
        return this.Employee + this.Employer;
    }
}

function CalculateSocialSecurity(grossIncome:number, exchangeRatio:number):SocialSecurityShares {
    let socialSecIncome = grossIncome;
    let grossIncomeBGN = grossIncome / exchangeRatio;
    if (grossIncomeBGN > MAX_SOCIAL_SEC_INCOME_BGN)
        socialSecIncome = MAX_SOCIAL_SEC_INCOME_BGN * exchangeRatio;

    let socialSec = new SocialSecurityShares();
    socialSec.Employee = socialSecIncome * SOCIAL_SEC_EMPLOYEE_PCT;
    socialSec.Employer = socialSecIncome * SOCIAL_SEC_EMPLOYER_PCT;
    return socialSec;
}


/*
========== Model ==========
 */


enum IncomeTypes {
    Net,
    Gross,
    Total
}

enum Currencies {
    EUR,
    BGN,
    GBP,
    USD
}



class Model {
    public IncomeGivenType:IncomeTypes = IncomeTypes.Net;
    public IncomeGiven:number;
    public Currency:Currencies = Currencies.EUR;
    public ExchangeRatio:number = EXCHANGE_RATIOS[Currencies.EUR];

    public NetIncome:number = 0.0;
    public TotalCostOfIncome:number = 0.0;
    public GrossIncome:number = 0.0;

    public TotalTaxes:number = 0.0;
    public TotalSocialSec:number = 0.0;
}


/*
========== View ==========
 */


let CURRENCY_SYMBOLS = ["€", "лв", "£", "$"]; // Reihenfolge wie bei Currencies

class View {
    sb_incomeGivenType:HTMLSelectElement;
    tx_incomeGiven:HTMLInputElement;
    sb_currency:HTMLSelectElement;
    lb_exchangeRatio:HTMLElement;

    lb_netIncome:HTMLElement;
    lb_totalTaxes:HTMLElement;
    lb_totalSocialSec:HTMLElement;
    lb_totalcostIncome:HTMLElement;
    lb_grossIncome:HTMLElement;


    constructor() {
        this.sb_incomeGivenType = document.getElementById("incometype") as HTMLSelectElement;
        this.sb_incomeGivenType.onchange = () => this.OnChanged(this);

        this.tx_incomeGiven = document.getElementById("income") as HTMLInputElement;
        this.tx_incomeGiven.onchange = () => this.OnChanged(this);
        this.tx_incomeGiven.onkeypress = (e:KeyboardEvent) => {
            if (e.key == "\n") this.OnChanged(this);
        };

        this.sb_currency = document.getElementById("currency") as HTMLSelectElement;
        this.sb_currency.onchange = () => this.OnChanged(this);

        this.lb_exchangeRatio = document.getElementById("exchangeratio");

        this.lb_netIncome = document.getElementById("netincome");
        this.lb_totalTaxes = document.getElementById("totaltaxes");
        this.lb_totalSocialSec = document.getElementById("totalsocialsec");
        this.lb_totalcostIncome = document.getElementById("tcoeincome");
        this.lb_grossIncome = document.getElementById("grossincome");
    }


    public get Model(): Model {
        let model = new Model();
        model.IncomeGivenType = this.IncomeGivenType;
        model.Currency = this.Currency;

        let x = parseFloat(this.tx_incomeGiven.value);
        model.IncomeGiven = isNaN(x) ? 0.0 : x;

        return model;
    }

    public Update(model: Model) {
        this.IncomeGivenType = model.IncomeGivenType;
        this.tx_incomeGiven.value = model.IncomeGiven.toFixed(2);
        this.Currency = model.Currency;
        this.lb_exchangeRatio.innerText = "(1лв=" + model.ExchangeRatio.toFixed(5) + CURRENCY_SYMBOLS[model.Currency] + ")";

        this.lb_netIncome.innerText = model.NetIncome.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];
        this.lb_totalTaxes.innerText = model.TotalTaxes.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];
        this.lb_totalSocialSec.innerText = model.TotalSocialSec.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];
        this.lb_totalcostIncome.innerText = model.TotalCostOfIncome.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];
        this.lb_grossIncome.innerText = model.GrossIncome.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];

    }


    INCOME_TYPE_OPTIONS = ["net","gross","tcoe"]
    get IncomeGivenType(): IncomeTypes {
        switch(this.sb_incomeGivenType.value){
            case this.INCOME_TYPE_OPTIONS[IncomeTypes.Net]: return IncomeTypes.Net;
            case this.INCOME_TYPE_OPTIONS[IncomeTypes.Gross]: return IncomeTypes.Gross;
            case this.INCOME_TYPE_OPTIONS[IncomeTypes.Total]: return IncomeTypes.Total;
        }
    }
    set IncomeGivenType(value:IncomeTypes) {
        this.sb_incomeGivenType.value = this.INCOME_TYPE_OPTIONS[value];
    }

    CURRENCY_OPTION = ["EUR","BGN","GBP", "USD"]
    get Currency(): Currencies {
        switch(this.sb_currency.value){
            case this.CURRENCY_OPTION[Currencies.EUR]: return Currencies.EUR;
            case this.CURRENCY_OPTION[Currencies.BGN]: return Currencies.BGN;
            case this.CURRENCY_OPTION[Currencies.GBP]: return Currencies.GBP;
            case this.CURRENCY_OPTION[Currencies.USD]: return Currencies.USD;

        }
    }
    set Currency(value:Currencies) {
        this.sb_currency.value = this.CURRENCY_OPTION[value];
    }

    public OnChanged: (view: View) => void;
}


/*
========== Construction/Run ==========
 */


let view = new View();
view.OnChanged = onInteraction;

