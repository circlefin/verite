# demo-site

## Getting Started

### Installing dependencies

```
npm install
```

### Running the server

```
npm run dev
```

### Linting the codebase

```
npm run lint
```

or, with autofix:

```
npm run lint --fix
```

## Sample Users

To minimize dependencies, we use an in-memory data store in lieu of a database.
The following users are added by default:

| id  | email          | password |
| --- | -------------- | -------- |
| 1   | alice@test.com | testing  |
| 2   | bob@test.com   | testing  |


## Sample DID Document

A did:web identifier must be prefixed with a fully qualified domain name that is secured by a TLS/SSL certificate; for now, a sample one is available at [ttp://localhost:3000/.well-known/did.json](http://localhost:3000/.well-known/did.json) with domain https://www.example.com.