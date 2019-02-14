import React, { Component, Fragment } from 'react';

export class Foldable extends Component {
  constructor(props){
    super(props);
    this.state = {
      active: false
    };
  }

  componentDidMount(){
    // this.onChange();
  }

  onChange(){
    const { onClose } = this.props;
    const { active } = this.state;
    if (onClose && !active) {
      onClose();
    }
  }

  render(){
    const { title } = this.props;
    const { active } = this.state;

    return (
      <div className={
        `foldable ${ active && 'foldableActive' }`
      }>
          <div
            className='title'
            onClick={ (e) => this.setState({ active: !active },
              () => this.onChange() ) }
          >
            <span>{ title }</span>
            <div className='icon'>{ active ? '-' : '+' }</div>
          </div>
          { active &&
            <div className='content'>
              {this.props.children}
            </div>
          }
      </div>
    )
  }
}
