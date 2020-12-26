import React, { useState, useRef, useEffect } from "react";
import "./Nominate.css";
import { useFormFields } from "../libs/hooksLib";
import { API } from "aws-amplify";
import { onError } from "../libs/errorLib";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Jumbotron,
  Card,
  Table,
} from "react-bootstrap";

export default function Nominate() {
  const apiUrl = "http://www.omdbapi.com/";
  const apiKey = process.env.REACT_APP_API_KEY;
  const [doneSearch, setDoneSearch] = useState(false);
  const searchRef = useRef(null);
  const [searchVal, setSearchVal] = useState(null);
  const [res, setRes] = useState([]);
  const [getRes, setGetRes] = useState([]);
  const [fields, handleFieldChange] = useFormFields({
    search: "",
  });

  useEffect(() => {
		onLoad();
	// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onLoad() {
    try {
      await getNomination();
    } catch (e) {
      if (e !== "No current user") {
        onError(e);
      }
    }
	}

	console.log(getRes);

  function createNomination(nomination) {
    return API.post(`shoppies`, "/shoppies", {
      body: nomination,
    });
  }

  async function getNomination() {
    return API.get(`shoppies`, `/shoppies`, {})
      .then((res) => {
				setGetRes(res);
      });
	}
	
	async function deleteNomination(imdbID) {
    return API.del(`shoppies`, `/shoppies/${imdbID}`);
	}

	async function handleDeletion(event, imdbID){
		event.preventDefault();
		
    try {
			await deleteNomination(imdbID);
			await getNomination();
    } catch (e) {
      onError(e);
      setDoneSearch(false);
    }
	}

  async function handleNomination(event, el) {
    event.preventDefault();

    try {
			const imdbID = el.imdbID;
			const Title = el.Title;
			const Year = el.Year;
      await createNomination({ Title, Year, imdbID });
			await getNomination();
    } catch (e) {
      onError(e);
      setDoneSearch(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSearchVal(fields.search);

    try {
      await fetch(apiUrl + `?s=${fields.search}&apikey=${apiKey}`)
        .then((res) => res.json())
        .then((result) => {
          setRes(result);
        });
      setDoneSearch(true);
    } catch (e) {
      onError(e);
      setDoneSearch(false);
    }
  }

  function renderCurrentNominations(nominations) {
    return nominations.map((el) => (
      <tr>
        <td>{el.Title}</td>
        <td>{el.Year}</td>
        <td>
          <Form onSubmit={(e) => handleDeletion(e, el.imdbID)}>
            <Button type="submit" className="ms-2 btn btn-danger">
              Remove
            </Button>
          </Form>
        </td>
      </tr>
		));
  }

  function renderMovies(res) {
    return res.Search.map((el) => (
      <tr>
        <td>{el.Title}</td>
        <td>{el.Year}</td>
        <td>
          <Form onSubmit={(e) => handleNomination(e, el)}>
            <Button type="submit" className="ms-2 btn btn-secondary">
              Nominate
            </Button>
          </Form>
        </td>
      </tr>
    ));
  }

  function renderSearch() {
    return (
      <>
        <Row>
          <Col className="col-sm-6">
            <Card>
              <Card.Body>
                <Card.Title>{`Search results for: ${searchVal}`}</Card.Title>
                <Card.Text>
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Year</th>
                        <th></th>
                      </tr>
                    </thead>
                      {renderMovies(res)}
                  </Table>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col className="col-sm-6">
            <Card>
              <Card.Body>
                <Card.Title>Your Nominations</Card.Title>
                <Card.Text>
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Year</th>
                        <th></th>
                      </tr>
                    </thead>
                      {renderCurrentNominations(getRes)}
                  </Table>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  function renderNominationsOnly() {
    return (
      <Col className="col-sm-12">
        <Card>
          <Card.Body>
            <Card.Title>Your Nominations</Card.Title>
            <Card.Text>
              <Table hover>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Year</th>
                    <th></th>
                  </tr>
                </thead>
                  {renderCurrentNominations(getRes)}
              </Table>
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    );
  }

  return (
    <div className="Nominate">
      <Container className="lander">
        <Jumbotron>
          <Row>
            <Col className="jumbo">
              <h1 className="text">Shoppies Nominations</h1>
            </Col>
          </Row>
          <Row>
            <Col className="jumbo">
              <Form inline onSubmit={handleSubmit} className="w-100 pt-3">
                <Form.Group controlId="search" className="w-75">
                  <Form.Label srOnly>Search</Form.Label>
                  <Form.Control
                    className="mb-2 w-100 mr-sm-2 p-3"
                    autoFocus
                    ref={searchRef}
                    type="text"
                    placeholder="Search"
                    value={fields.search}
                    onChange={handleFieldChange}
                  />
                </Form.Group>
                <Button type="submit" className="mb-2">
                  Submit
                </Button>
              </Form>
            </Col>
          </Row>
        </Jumbotron>
        {doneSearch === true ? renderSearch() : renderNominationsOnly()}
      </Container>
    </div>
  );
}
