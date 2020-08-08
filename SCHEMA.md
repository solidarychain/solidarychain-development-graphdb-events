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
```

```shell
CREATE CONSTRAINT participant_code ON (n:Participant) ASSERT n.code IS UNIQUE;
CREATE CONSTRAINT participant_name ON (n:Participant) ASSERT n.name IS UNIQUE;
CREATE CONSTRAINT person_document_number ON (n:Person) ASSERT n.documentNumber IS UNIQUE;
CREATE CONSTRAINT person_identity_number ON (n:Person) ASSERT n.identityNumber IS UNIQUE;
CREATE CONSTRAINT person_fiscal_number ON (n:Person) ASSERT n.fiscalNumber IS UNIQUE;
CREATE CONSTRAINT person_social_security_number ON (n:Person) ASSERT n.socialSecurityNumber IS UNIQUE;
CREATE CONSTRAINT person_beneficiary_number ON (n:Person) ASSERT n.beneficiaryNumber IS UNIQUE;
CREATE CONSTRAINT cause_name ON (n:Cause) ASSERT n.name IS UNIQUE;
CREATE CONSTRAINT asset_name ON (n:Asset) ASSERT n.name IS UNIQUE;
```
