import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";
import { portfolioData } from "../data/portfolio";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              <a href={`mailto:${portfolioData.email}`} data-cursor="disable">
                {portfolioData.email}
              </a>
            </p>
            <h4>Education</h4>
            <p>{portfolioData.education}</p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            <a
              href={portfolioData.socials.github}
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Github <MdArrowOutward />
            </a>
            <a
              href={portfolioData.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Linkedin <MdArrowOutward />
            </a>
            <a
              href={portfolioData.socials.twitter}
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Twitter <MdArrowOutward />
            </a>
            <a
              href={portfolioData.socials.instagram}
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Instagram <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              {portfolioData.footerText} <br /> by{" "}
              <span>{portfolioData.fullName}</span>
            </h2>
            <h5>
              <MdCopyright /> {portfolioData.footerYear}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
