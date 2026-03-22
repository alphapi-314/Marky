## DB Schemas

### 1. User Schema
- username
- email
- password
- authorName
- ownedPages
- savedPages
- timestamps

### 2. Page Schema
- page_id
- authorName
- title
- contentID
- count
- comments
- embeddings
- timestamps

### 3. Comments Schema
- comment_id
- page_id
- authorName
- count
- parentID
- comments
- content
- timestamps

### 4. Web Page Content
- contentID
- content in JSON
- timestamps

### 5. Embeddings
- vector embeddings for searching it



