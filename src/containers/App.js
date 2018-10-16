import _ from 'lodash';
import React, { Component } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import { parseCode } from '../helpers/parse-code';

import logo from '../assets/kw-logo.svg';
import './App.css';

class App extends Component {
  state = {
    code: '',
    parsed: null,
    error: ''
  }

  onReset = () => {
    this.setState({
      code: '',
      parsed: null,
      error: ''
    })
  }

  renderResult = parsed => {
    const formatted = _.mapValues(parsed, expression => {
      const result = eval(expression);

      if (_.isFunction(result) && result.name) {
        return <div className="expression function">{'FUNCTION: ' + result.name}</div>;
      } else if (_.isBoolean(result)) {
        return <div className="expression boolean">{result ? 'TRUE' : 'FALSE'}</div>;
      } else if (_.isObject(result) || _.isArray(result)) {
        return <div className="expression object">{JSON.stringify(result)}</div>;
      }

      return result && <div className={`expression ${typeof result}`}>{result}</div>;
    });

    return _.map(formatted, (expression, line) => {
      if (expression) {
        return (
          <div key={line} className="result">
            {expression}
            <div className="line-number">Line {line}</div>
          </div>
        )
      }
    });
  }

  render() {
    return (
      <div className="container">
        <header className="header">
          <span>JS Playground by</span>
          <img src={logo} alt="Kwanwoo Jeong"/>
        </header>
        <div className="code-container">
          <div className="buttons">
            <button onClick={this.onReset}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path className="clear" fill="white" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <CodeMirror
            value={this.state.code}
            options={{
              mode: 'javascript',
              theme: 'material',
              lineNumbers: true
            }}
            onBeforeChange={(editor, data, value) => {
              this.setState({ code: value });
            }}
            onChange={(editor, data, value) => {
              let parsed, error;

              try {
                parsed = parseCode(value);
              } catch (e) {
                error = e.toString();
              }

              this.setState({ parsed, error });
            }}
          />
        </div>

        {this.state.parsed && (
          <div className="results">
            <h2>Result</h2>
            {this.state.parsed && this.renderResult(this.state.parsed)}
          </div>
        )}

        {this.state.error && (
          <div className="error">
            <h2>Error</h2>
            {this.state.error}
          </div>
        )}
      </div>
    );
  }
}

export default App;
