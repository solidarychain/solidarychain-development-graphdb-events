# SCHEMA Notes

- [Table 5.18. Syntax for managing indexes](https://neo4j.com/docs/cypher-manual/current/administration/constraints/)

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

```shell
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
CREATE CONSTRAINT CauseIdConstraint ON (n:cause) ASSERT n.id IS UNIQUE;
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
