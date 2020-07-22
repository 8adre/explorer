import React, { FC, useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Container } from './TargetProperty.styles';
import { createCollection } from './utils/createCollection';
import { createTree } from './utils/createTree';

import Label from '../Label';
import Dropdown from '../Dropdown';
import PropertiesTree from '../PropertiesTree';
import PropertyContainer from '../PropertyContainer';

import { useSearch } from '../../hooks';
import { getCollectionSchema } from '../../modules/events';
import { getTargetProperty, selectTargetProperty } from '../../modules/query';

import text from './text.json';

import { AppState } from '../../types';

type Props = {
  /** Events collection identifer */
  collection: string;
};

const TargetProperty: FC<Props> = ({ collection }) => {
  const [propertiesTree, setPropertiesTree] = useState({});
  const [isOpen, setOpen] = useState(false);
  const containerRef = useRef(null);
  const dispatch = useDispatch();

  const collectionSchema = useSelector((state: AppState) =>
    getCollectionSchema(state, collection)
  );
  const targetProperty = useSelector(getTargetProperty);

  const { propertiesCollection } = useMemo(() => {
    if (collectionSchema) {
      return {
        propertiesCollection: createCollection(collectionSchema),
      };
    }

    return {
      propertiesCollection: [],
    };
  }, [collectionSchema]);

  const { searchHandler } = useSearch<{
    propertyPath: string;
    propertyType: string;
  }>(
    propertiesCollection,
    (searchResult) => {
      const searchTree = {};
      searchResult.forEach(({ propertyPath, propertyType }) => {
        searchTree[propertyPath] = propertyType;
      });

      setPropertiesTree(createTree(searchTree));
    },
    {
      keys: ['propertyPath', 'propertyType'],
      threshold: 0.4,
    }
  );

  useEffect(() => {
    if (
      collectionSchema &&
      !Object.keys(collectionSchema).includes(targetProperty)
    ) {
      dispatch(selectTargetProperty(null));
    }

    return () => dispatch(selectTargetProperty(null));
  }, [collection]);

  useEffect(() => {
    if (collectionSchema) {
      setPropertiesTree(createTree(collectionSchema));
    }
  }, [collectionSchema]);

  return (
    <Container ref={containerRef}>
      <Label>{text.label}</Label>
      <PropertyContainer
        onClick={() => !isOpen && setOpen(true)}
        isActive={isOpen}
        value={targetProperty}
        searchable
        onSearch={searchHandler}
        onDefocus={(event: any) => {
          if (!event.path?.includes(containerRef.current)) {
            setPropertiesTree(createTree(collectionSchema));
            setOpen(false);
          }
        }}
      >
        {targetProperty}
      </PropertyContainer>
      <Dropdown isOpen={isOpen}>
        <PropertiesTree
          data-dropdown="targeter"
          onClick={(_e, property) => {
            setOpen(false);
            dispatch(selectTargetProperty(property));
            setPropertiesTree(createTree(collectionSchema));
          }}
          properties={propertiesTree}
        />
      </Dropdown>
    </Container>
  );
};

export default TargetProperty;
