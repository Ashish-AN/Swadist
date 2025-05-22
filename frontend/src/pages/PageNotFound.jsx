import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong } from "@fortawesome/free-solid-svg-icons";
import "../styles/PageNotFound.css";

function PageNotFound() {
  const navigate = useNavigate();
  return (
    <div className="text-center mt-5 page-not-found">
      <Button
        variant="secondary"
        className="go-back-btn"
        onClick={() => navigate(-1)}
      >
        <FontAwesomeIcon icon={faLeftLong} style={{ marginRight: "4px" }} />
        Go Back
      </Button>
    </div>
  );
}

export default PageNotFound;
