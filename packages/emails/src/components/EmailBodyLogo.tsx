import RawHtml from "./RawHtml";
import Row from "./Row";

const CommentIE = ({ html = "" }) => <RawHtml html={`<!--[if mso | IE]>${html}<![endif]-->`} />;

const EmailBodyLogo = () => {
  return (
    <>
      <CommentIE
        html={`</td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"></td>`}
      />
      <div style={{ margin: "0px auto", maxWidth: 600 }}>
        <Row align="center" border="0" style={{ width: "100%" }}>
          <td
            style={{
              direction: "ltr",
              fontSize: "0px",
              padding: "0px",
              textAlign: "center",
            }}>
            <CommentIE
              html={`<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:600px;" >`}
            />
            <div
              className="mj-column-per-100 mj-outlook-group-fix"
              style={{
                fontSize: "0px",
                textAlign: "left",
                direction: "ltr",
                display: "inline-block",
                verticalAlign: "top",
                width: "100%",
              }}>
              <Row border="0" style={{ verticalAlign: "top" }} width="100%">
                <td
                  align="center"
                  style={{
                    fontSize: "0px",
                    padding: "24px 25px",
                    paddingTop: "32px",
                    wordBreak: "break-word",
                    backgroundColor: "#f8f8f8",
                    borderRadius: "0 0 8px 8px",
                  }}>
                  <div
                    style={{
                      fontFamily: "'DM Sans', Helvetica, sans-serif",
                      fontSize: "12px",
                      lineHeight: "1.6",
                      textAlign: "center",
                      color: "#777777",
                    }}>
                    <p style={{ margin: "0" }}>
                      <a
                        href="https://robuxio.com"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#002745",
                          textDecoration: "underline",
                          fontWeight: 500,
                        }}>
                        Visit Our Website
                      </a>
                    </p>
                  </div>
                </td>
              </Row>
            </div>
            <CommentIE html="</td></tr></table>" />
          </td>
        </Row>
      </div>
    </>
  );
};

export default EmailBodyLogo;
