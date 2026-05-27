import { Switch, Route, Router as WouterRouter } from "wouter";
import BottomNav from "@/components/BottomNav";
import Dashboard from "@/pages/Dashboard";
import MyLoans from "@/pages/MyLoans";
import EmiPayments from "@/pages/EmiPayments";
import Offers from "@/pages/Offers";
import More from "@/pages/More";

function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <WouterRouter base={base}>
      <div className="min-h-screen bg-[#F7F8FC] flex justify-center">
        <div className="w-full max-w-sm min-h-screen bg-[#F7F8FC] relative flex flex-col">
          <div className="flex-1 overflow-y-auto pb-20">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/my-loans" component={MyLoans} />
              <Route path="/emi-payments" component={EmiPayments} />
              <Route path="/offers" component={Offers} />
              <Route path="/more" component={More} />
            </Switch>
          </div>
          <BottomNav />
        </div>
      </div>
    </WouterRouter>
  );
}

export default App;
