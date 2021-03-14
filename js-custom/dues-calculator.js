//TODO: Wechselkurse dynamisch laden (einmalig)
var EXCHANGE_RATIOS = [0.51125, 1.0, 0.43901, 0.61071]; // In der Reihenfolge der Currencies, https://themoneyconverter.com/BGN/EUR
var SOCIAL_SEC_EMPLOYEE_PCT = 0.1378;
var SOCIAL_SEC_EMPLOYER_PCT = 0.1892;
var TAX_PCT = 0.1000;
var MAX_SOCIAL_SEC_INCOME_BGN = 3000.00;
function onInteraction(view) {
    var model = view.Model;
    model.ExchangeRatio = EXCHANGE_RATIOS[model.Currency];
    var socialSecurityShares;
    if (model.IncomeGivenType == IncomeTypes.Total) {
        model.GrossIncome = model.IncomeGiven / (1 + SOCIAL_SEC_EMPLOYER_PCT);
        socialSecurityShares = CalculateSocialSecurity(model.GrossIncome, model.ExchangeRatio);
        model.GrossIncome = model.IncomeGiven - socialSecurityShares.Employer;
    }
    else if (model.IncomeGivenType == IncomeTypes.Net) {
        var taxableIncome_1 = model.IncomeGiven / (1 - TAX_PCT);
        model.GrossIncome = taxableIncome_1 / (1 - SOCIAL_SEC_EMPLOYEE_PCT);
        socialSecurityShares = CalculateSocialSecurity(model.GrossIncome, model.ExchangeRatio);
        model.GrossIncome = taxableIncome_1 + socialSecurityShares.Employee;
    }
    else {
        model.GrossIncome = model.IncomeGiven;
        socialSecurityShares = CalculateSocialSecurity(model.GrossIncome, model.ExchangeRatio);
    }
    model.TotalSocialSec = socialSecurityShares.Total;
    model.TotalCostOfIncome = model.GrossIncome + socialSecurityShares.Employer;
    var taxableIncome = model.GrossIncome - socialSecurityShares.Employee;
    model.TotalTaxes = taxableIncome * TAX_PCT;
    model.NetIncome = taxableIncome - model.TotalTaxes;
    view.Update(model);
}
var SocialSecurityShares = /** @class */ (function () {
    function SocialSecurityShares() {
    }
    Object.defineProperty(SocialSecurityShares.prototype, "Total", {
        get: function () {
            return this.Employee + this.Employer;
        },
        enumerable: false,
        configurable: true
    });
    return SocialSecurityShares;
}());
function CalculateSocialSecurity(grossIncome, exchangeRatio) {
    var socialSecIncome = grossIncome;
    var grossIncomeBGN = grossIncome / exchangeRatio;
    if (grossIncomeBGN > MAX_SOCIAL_SEC_INCOME_BGN)
        socialSecIncome = MAX_SOCIAL_SEC_INCOME_BGN * exchangeRatio;
    var socialSec = new SocialSecurityShares();
    socialSec.Employee = socialSecIncome * SOCIAL_SEC_EMPLOYEE_PCT;
    socialSec.Employer = socialSecIncome * SOCIAL_SEC_EMPLOYER_PCT;
    return socialSec;
}
/*
========== Model ==========
 */
var IncomeTypes;
(function (IncomeTypes) {
    IncomeTypes[IncomeTypes["Net"] = 0] = "Net";
    IncomeTypes[IncomeTypes["Gross"] = 1] = "Gross";
    IncomeTypes[IncomeTypes["Total"] = 2] = "Total";
})(IncomeTypes || (IncomeTypes = {}));
var Currencies;
(function (Currencies) {
    Currencies[Currencies["EUR"] = 0] = "EUR";
    Currencies[Currencies["BGN"] = 1] = "BGN";
    Currencies[Currencies["GBP"] = 2] = "GBP";
    Currencies[Currencies["USD"] = 3] = "USD";
})(Currencies || (Currencies = {}));
var Model = /** @class */ (function () {
    function Model() {
        this.IncomeGivenType = IncomeTypes.Net;
        this.Currency = Currencies.EUR;
        this.ExchangeRatio = EXCHANGE_RATIOS[Currencies.EUR];
        this.NetIncome = 0.0;
        this.TotalCostOfIncome = 0.0;
        this.GrossIncome = 0.0;
        this.TotalTaxes = 0.0;
        this.TotalSocialSec = 0.0;
    }
    return Model;
}());
/*
========== View ==========
 */
var CURRENCY_SYMBOLS = ["€", "лв", "£", "$"]; // Reihenfolge wie bei Currencies
var View = /** @class */ (function () {
    function View() {
        var _this = this;
        this.INCOME_TYPE_OPTIONS = ["net", "gross", "tcoe"];
        this.CURRENCY_OPTION = ["EUR", "BGN", "GBP", "USD"];
        this.sb_incomeGivenType = document.getElementById("incometype");
        this.sb_incomeGivenType.onchange = function () { return _this.OnChanged(_this); };
        this.tx_incomeGiven = document.getElementById("income");
        this.tx_incomeGiven.onchange = function () { return _this.OnChanged(_this); };
        this.tx_incomeGiven.onkeypress = function (e) {
            if (e.key == "\n")
                _this.OnChanged(_this);
        };
        this.sb_currency = document.getElementById("currency");
        this.sb_currency.onchange = function () { return _this.OnChanged(_this); };
        this.lb_exchangeRatio = document.getElementById("exchangeratio");
        this.lb_netIncome = document.getElementById("netincome");
        this.lb_totalTaxes = document.getElementById("totaltaxes");
        this.lb_totalSocialSec = document.getElementById("totalsocialsec");
        this.lb_totalcostIncome = document.getElementById("tcoeincome");
        this.lb_grossIncome = document.getElementById("grossincome");
    }
    Object.defineProperty(View.prototype, "Model", {
        get: function () {
            var model = new Model();
            model.IncomeGivenType = this.IncomeGivenType;
            model.Currency = this.Currency;
            var x = parseFloat(this.tx_incomeGiven.value);
            model.IncomeGiven = isNaN(x) ? 0.0 : x;
            return model;
        },
        enumerable: false,
        configurable: true
    });
    View.prototype.Update = function (model) {
        this.IncomeGivenType = model.IncomeGivenType;
        this.tx_incomeGiven.value = model.IncomeGiven.toFixed(2);
        this.Currency = model.Currency;
        this.lb_exchangeRatio.innerText = "(1лв=" + model.ExchangeRatio.toFixed(5) + CURRENCY_SYMBOLS[model.Currency] + ")";
        this.lb_netIncome.innerText = model.NetIncome.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];
        this.lb_totalTaxes.innerText = model.TotalTaxes.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];
        this.lb_totalSocialSec.innerText = model.TotalSocialSec.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];
        this.lb_totalcostIncome.innerText = model.TotalCostOfIncome.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];
        this.lb_grossIncome.innerText = model.GrossIncome.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];
    };
    Object.defineProperty(View.prototype, "IncomeGivenType", {
        get: function () {
            switch (this.sb_incomeGivenType.value) {
                case this.INCOME_TYPE_OPTIONS[IncomeTypes.Net]: return IncomeTypes.Net;
                case this.INCOME_TYPE_OPTIONS[IncomeTypes.Gross]: return IncomeTypes.Gross;
                case this.INCOME_TYPE_OPTIONS[IncomeTypes.Total]: return IncomeTypes.Total;
            }
        },
        set: function (value) {
            this.sb_incomeGivenType.value = this.INCOME_TYPE_OPTIONS[value];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(View.prototype, "Currency", {
        get: function () {
            switch (this.sb_currency.value) {
                case this.CURRENCY_OPTION[Currencies.EUR]: return Currencies.EUR;
                case this.CURRENCY_OPTION[Currencies.BGN]: return Currencies.BGN;
                case this.CURRENCY_OPTION[Currencies.GBP]: return Currencies.GBP;
                case this.CURRENCY_OPTION[Currencies.USD]: return Currencies.USD;
            }
        },
        set: function (value) {
            this.sb_currency.value = this.CURRENCY_OPTION[value];
        },
        enumerable: false,
        configurable: true
    });
    return View;
}());
/*
========== Construction/Run ==========
 */
var view = new View();
view.OnChanged = onInteraction;
