import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { portfolioData } from "../data/portfolio";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              {portfolioData.firstName.toUpperCase()}
              <br />
              <span>{portfolioData.lastName.toUpperCase()}</span>
            </h1>
          </div>
          <div className="landing-info">
            <h3>{portfolioData.rolePrefix}</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">{portfolioData.rolePrimary}</div>
              <div className="landing-h2-2">{portfolioData.roleSecondary}</div>
            </h2>
            <h2>
              <div className="landing-h2-info">
                {portfolioData.roleSecondary}
              </div>
              <div className="landing-h2-info-1">
                {portfolioData.rolePrimary}
              </div>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
