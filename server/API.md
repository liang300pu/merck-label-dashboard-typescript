# Merck Label Dashboard API Guide

# Samples
## Relevant Types
```json
{
    "id": String,
    "audit_id": String,
    "audit_number": Int,
    "team_name": String,
    "date_created": Date,
    "date_modified": Date,
    "expiration_date": Date,
    "data": JSON
}
```

## `GET` /:team/samples
## `GET` /:team/samples/:id
## `GET` /:team/samples/:id/audit
## `GET` /samples

## `POST` /:team/samples

## `PATCH` /:team/samples/:id

## `DELETE` /:team/samples/:id

---

# Teams
## Relevant Types
```json
{
    "id": Int,
    "name": String,
    "status": Int
}
```

## `GET` /teams

## `POST` /teams

## `PATCH` /teams/:id

## `DELETE` /teams/:id

---

# Teams Fields
## Relevant Types
```json
{
    "id": Int,
    "team_name": String,
    "name": String,
    "display_name": String,
    "status": Int
}
```

## `GET` /:team/fields

## `GET` /:team/fields/:id

## `POST` /:team/fields

## `PATCH` /:team/fields/:id

## `DELETE` /:team/fields/:id

---

# Teams Labels
## Relevant Types
```json
{
    "id": Int,
    "team_name": String,
    "width": Int,
    "length": Int,
    "data": JSON
}
```

## `GET` /:team/labels

## `POST` /:team/labels

---

# Printers
## Relevant Types
```json
{
    "id": Int,
    "ip": String,
    "name": String,
    "location": String,
    "status": Int
}
```

## `GET` /printers

## `POST` /printers

## `DELETE` /printers/:ip

## `PATCH` /printers/:ip

---

