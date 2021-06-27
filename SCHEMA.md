# SCHEMA Notes

- [Table 5.18. Syntax for managing indexes](https://neo4j.com/docs/cypher-manual/current/administration/constraints/)

## Notes

> scroll down to goto to SCHEMA

```cypher
// Create a unique node property constraint.
CREATE CONSTRAINT [constraint_name]
  ON (n:LabelName)
ASSERT 
  n.propertyName IS UNIQUE

// Drop a constraint.
DROP CONSTRAINT constraint_name

// List all constraints in the database.
CALL db.constraints

// Create a single-property index.
CREATE INDEX [index_name]
  FOR (n:LabelName)
ON 
  (n.propertyName);

// Create a composite index.  
CREATE INDEX [index_name]
FOR (n:LabelName)
ON (n.propertyName_1,
    n.propertyName_2,
    …
    n.propertyName_n)

// List all indexes in the database.
CALL db.indexes
```

## Schema (Paste in new Database)

```cypher
CREATE CONSTRAINT ParticipantIdConstraint ON (n:Participant) ASSERT n.id IS UNIQUE;
CREATE CONSTRAINT ParticipantCodeConstraint ON (n:Participant) ASSERT n.code IS UNIQUE;
CREATE CONSTRAINT ParticipantNameConstraint ON (n:Participant) ASSERT n.name IS UNIQUE;

CREATE CONSTRAINT PersonIdConstraint ON (n:Person) ASSERT n.id IS UNIQUE;
CREATE CONSTRAINT PersonDocumentNumberConstraint ON (n:Person) ASSERT n.documentNumber IS UNIQUE;
CREATE CONSTRAINT PersonIdentityNumberConstraint ON (n:Person) ASSERT n.identityNumber IS UNIQUE;
CREATE CONSTRAINT PersonFiscalNumberConstraint ON (n:Person) ASSERT n.fiscalNumber IS UNIQUE;
CREATE CONSTRAINT PersonSocialSecurityNumberConstraint ON (n:Person) ASSERT n.socialSecurityNumber IS UNIQUE;
CREATE CONSTRAINT PersonBeneficiaryNumberConstraint ON (n:Person) ASSERT n.beneficiaryNumber IS UNIQUE;
CREATE CONSTRAINT PersonPanConstraint ON (n:Person) ASSERT n.pan IS UNIQUE;
CREATE CONSTRAINT CauseIdConstraint ON (n:Cause) ASSERT n.id IS UNIQUE;
CREATE CONSTRAINT CauseNameConstraint ON (n:Cause) ASSERT n.name IS UNIQUE;
CREATE CONSTRAINT AssetIdConstraint ON (n:Asset) ASSERT n.id IS UNIQUE;
CREATE CONSTRAINT AssetNameConstraint ON (n:Asset) ASSERT n.name IS UNIQUE;
CREATE CONSTRAINT TransactionIdConstraint ON (n:Transaction) ASSERT n.id IS UNIQUE;

CREATE INDEX ParticipantEmailIndex FOR (n:Participant) ON (n.email);

CREATE INDEX PersonNameIndex FOR (n:Person) ON (n.name);
CREATE INDEX PersonUsernameIndex FOR (n:Person) ON (n.username);
CREATE INDEX PersonEmailIndex FOR (n:Person) ON (n.email);
CREATE INDEX PersonMobilePhoneIndex FOR (n:Person) ON (n.mobilePhone);
CREATE INDEX PersonRegionIndex FOR (n:Person) ON (n.region);
CREATE INDEX PersonGeoLocationIndex FOR (n:Person) ON (n.geoLocation);
CREATE INDEX PersonCountryIndex FOR (n:Person) ON (n.country);
CREATE INDEX PersonCreatedDateIndex FOR (n:Person) ON (n.createdDate);

CREATE INDEX AssetAssetTypeIndex FOR (n:Asset) ON (n.assetType);
CREATE INDEX AssetCreatedDateIndex FOR (n:Asset) ON (n.createdDate);

CREATE INDEX CauseEmailIndex FOR (n:Cause) ON (n.email);
CREATE INDEX CauseTagsIndex FOR (n:Cause) ON (n.tags);
CREATE INDEX CauseOwnerIndex FOR (n:Cause) ON (n.owner);
CREATE INDEX CauseCreatedDateIndex FOR (n:Cause) ON (n.createdDate);

CREATE INDEX TransactionTransactionTypeIndex FOR (n:Transaction) ON (n.transactionType);
CREATE INDEX TransactionResourceTypeIndex FOR (n:Transaction) ON (n.resourceType);
CREATE INDEX TransactionAssetIdIndex FOR (n:Transaction) ON (n.assetId);
CREATE INDEX TransactionCreatedDateIndex FOR (n:Transaction) ON (n.createdDate);
```

## Schema (Paste in new Network after Remove all Nodes)

```cypher
MERGE (g {
  id: "00000000-0000-0000-0000-000000000000"
})
MERGE (n:Participant {
  id: "c8ca045c-9d1b-407f-b9ae-31711758f2d0",
  code: "gov",
  name: "Big Government"
})-[:CONNECTED]->(g);

MATCH (g {
  id: "00000000-0000-0000-0000-000000000000"
})
MERGE (n:Person {
  id: "4ea88521-031b-4279-9165-9c10e1839000",
  fiscalNumber: "PT182692123",
  mobilePhone: "+351936200000",
  otherInformation: "",
  username: "admin",
  password: "Aa123#12",
  email: "admin@example.com"
})-[:CONNECTED]->(g);

MATCH (g {
  id: "00000000-0000-0000-0000-000000000000"
})
MERGE (n:Person {
  id: "4ea88521-031b-4279-9165-9c10e1839001",
  fiscalNumber: "PT999999990",
  mobilePhone: "+351936200001",
  otherInformation: "",
  username: "anon",
  password: "Aa123#12",
  email: "anon@example.com"
})-[:CONNECTED]->(g);


MATCH (g {
  id: "00000000-0000-0000-0000-000000000000"
})
MERGE (n:Person {
  id: "4ea88521-031b-4279-9165-9c10e1839002",
  firstName: "John",
  lastName: "Doe",
  beneficiaryNumber: "285191659",
  birthDate: "61985472",
  cardVersion: "006.007.23",
  country: "PRT",
  documentNumber: "09879462 0 ZZ3",
  documentType: "Cartão De Cidadão",
  emissionDate: "61985472",
  emittingEntity: "República Portuguesa",
  expirationDate: "61985472",
  fatherFirstName: "Alberto",
  fatherLastName: "De Andrade Monteiro",
  fiscalNumber: "182692124",
  gender: "M",
  height: "1.81",
  identityNumber: "098794620",
  motherFirstName: "Maria Da Graça De Oliveira Mendes",
  motherLastName: "Monteiro",
  nationality: "PRT",
  otherInformation: "",
  pan: "0000036014662658",
  requestLocation: "CRCiv. Figueira da Foz",
  socialSecurityNumber: "11103478242",
  username: "johndoe",
  password: "Aa456#45",
  email: "johndoe@mail.com"
})-[:CONNECTED]->(g);
```

check with

```cypher
MATCH (n)-[r]-(m) RETURN n,m,r;
```
