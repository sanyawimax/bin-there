import footerImage from "../assets/binthere-footer.png";

function PageFooter() {
  return (
    <footer className="page-footer">
      <div
        className="footer-art"
        style={{ backgroundImage: `url(${footerImage})` }}
      ></div>
    </footer>
  );
}

export default PageFooter;