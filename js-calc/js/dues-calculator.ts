function onInteraction(view:View) {

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

let EXCHANGE_RATIOS = [0.51125, 1.0, 0.43901, 0.61071] // In der Reihenfolge der Currencies, https://themoneyconverter.com/BGN/EUR


class Model {
    public IncomeGiven:IncomeTypes = IncomeTypes.Net;
    public Currency:Currencies = Currencies.EUR;
    public ExchangeRatio:number = EXCHANGE_RATIOS[Currencies.EUR];

    public NetIncome:number;
    public TotalCostsOfIncome:number;
    public GrossIncome:number;

    public TotalTaxes:number;
    public TotalSocialSec:number;
}


/*
========== View ==========
 */


let CURRENCY_SYMBOLS = ["€", "лв", "£", "$"];

class View {
    public get(): Model {
        return null;
    }

    public Update(model: Model) {

    }

    public OnChanged: (view: View) => void;
}


/*
========== Construction/Run ==========
 */


let view = new View();
view.OnChanged = onInteraction;


