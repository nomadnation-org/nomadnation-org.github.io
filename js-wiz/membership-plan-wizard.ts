enum MembershipPlans {
    None,
    Visitor,
    Tourist,
    Resident,
    Expat_Free,
    Expat_LLC
}

class Model {
    public EUCitizen:boolean = false;

    public RecommendPlan:MembershipPlans = MembershipPlans.None;
}


class ViewPlan {
    preview:HTMLElement;
    overview:HTMLElement;

    kind:string;

    constructor(kind:string) {
        this.kind = kind;

        this.preview = document.getElementById("planpreview-" + kind);
        this.overview = document.getElementById("plan-" + kind);

        console.log("viewplan ctor: " + kind + "/" + this.preview + "/" + this.overview);
    }

    public set Recommend(value:boolean) {
        console.log("viewplan recommend: " + this.kind + "=" + value);

        if (this.preview != null) this.preview.className = "planpreview_body" + (value ? " show" : "");
        if (this.overview != null) this.overview.className = "plan_body" + (value ? " recommended" : "");
    }
}

class ViewPlans {
    plans:ViewPlan[];

    constructor(initialRecommendedPlan:MembershipPlans) {
        this.plans = new Array();
        this.plans[MembershipPlans.None] = new ViewPlan("none");
        this.plans[MembershipPlans.Visitor] = new ViewPlan("visitor");
        this.plans[MembershipPlans.Tourist] = new ViewPlan("tourist");
        this.plans[MembershipPlans.Resident] = new ViewPlan("resident");
        this.plans[MembershipPlans.Expat_Free] = new ViewPlan("expat-free");
        this.plans[MembershipPlans.Expat_LLC] = new ViewPlan("expat-llc");

        this.Update(initialRecommendedPlan);
    }

    public Update(recommendedPlan:MembershipPlans) {
        [
            MembershipPlans.None,
            MembershipPlans.Visitor,
            MembershipPlans.Tourist,
            MembershipPlans.Resident,
            MembershipPlans.Expat_Free,
            MembershipPlans.Expat_LLC
        ].forEach((plan) => {
            this.plans[plan].Recommend = false;
        })

        this.plans[recommendedPlan].Recommend = true;
    }
}

class View {
    eu_citizen_yes:HTMLInputElement;
    eu_citizen_no:HTMLInputElement;

    plans:ViewPlans;


    constructor() {
        this.eu_citizen_yes = document.getElementById("yes") as HTMLInputElement;
        this.eu_citizen_yes.onclick = () => this.OnChanged(this);

        this.eu_citizen_no = document.getElementById("no") as HTMLInputElement;
        this.eu_citizen_no.onclick = () => this.OnChanged(this);

        this.plans = new ViewPlans(MembershipPlans.None);
    }


    public get ViewModel() : Model {
        let vm = new Model();
        vm.EUCitizen = this.eu_citizen_yes.checked;
        return vm;
    }

    public Update(vm:Model) {
        this.eu_citizen_yes.checked = vm.EUCitizen;
        this.eu_citizen_no.checked = !this.eu_citizen_yes.checked;

        this.plans.Update(vm.RecommendPlan);
    }


    public OnChanged : (view:View) => void;
}


function onInteraction(view:View) {
    let model = view.ViewModel;

    model.RecommendPlan = model.EUCitizen ? MembershipPlans.Expat_Free : MembershipPlans.Resident;

    view.Update(model);
}

let _view = new View();
_view.OnChanged = onInteraction;


