import RosterCard from "../components/rosterCard";
import { getUpcomingSaturdays } from "../utils/dateUtils";

const Home = () => {
  // get the upcoming saturday from dateUtils 
  
  return (
    <div>
      {/* get the upcoming saturday */}
      <RosterCard date={getUpcomingSaturdays()[0]} />
    </div>
  );
};

export default Home;
