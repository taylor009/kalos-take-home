Thanks in advance for spending time working on this project\! **Please** **don’t spend more than 4 hours** working on this. We work on quick timelines and don’t want to take too much of your time.

### **Objective**

Build a **Real-Time Sales Analytics Dashboard** that processes transactions and provides real-time analytics. 

This assignment will test your ability to handle front-end UI/UX, backend API design, real-time data updates, and complex backend processing.

## **Requirements**

### 

### **1\. User Interface**

* Dashboard Page  
  * Displays a table of sales transactions with columns:  
    * `Date`, `Customer Name`, `Amount`  
  * A search bar(s) to filter transactions by `Customer Name`  
  * Displays real-time analytics (e.g., total revenue)  
* Add Transaction Page  
  * Form to create a new transaction:  
    * Fields: `Customer Name`, `Amount`, `Currency`

### **2\. Real-Time Updates**

Broadcast new transactions and analytics from the backend to the frontend. The real-time analytics must be updated without refreshing the page.

* **Total Revenue**  
  * Sum of all transactions

---

### **Instructions**

* **Version Control**: Use Git for version control. Ensure a clean commit history that reflects your development process.  
* **Frontend:** You can use any frontend framework. Note: Kalos uses NextJS with Typescript, Tailwind CSS, and tRPC. But it is not important you follow suit.  
* **Backend**: You can use any backend framework or language. Note: Kalos uses Typescript with Hono for its backend. But it is not important you follow suit.

Include a `README.md` file with the following details:

* Setup instructions for running the app. This does not have to be anything fancy. It could be just one line saying “Run pnpm run dev”.  
* A description of your technical approach, key decisions, and trade-offs.  
* Any assumptions or limitations.  
* Points you’d like us to focus on during the review.

---

We’ll ask you to demo the project to kick off our review together.

Share with Arthur & Ashish on Github after you complete:   
arthurdvorkin, [dvorkinarthur@gmail.com](mailto:dvorkinarhtur@gmail.com)  
awarty-eng, [ashish.warty@gmail.com](mailto:ashish.warty@gmail.com)  
pranav-kalos, [pranav@getkalos.com](mailto:pranav@getkalos.com)

---

**What we’re looking for**  
We want to see how you build. Our approach to building is:

* **Clarity Over Cleverness** – Readable code that prioritizes maintainability over premature optimization.  
* **Maintainable Architecture** – The code should be structured in a way that is easy to extend, expand, or modify as requirements evolve.  
* **Separation of Concerns** – Clear separation. Each component should have a well-defined responsibility.  
* **Pragmatic Design** – Avoid unnecessary complexity or over-engineering; the solution should be as simple as possible.  
* **Moving Fast** – We move fast. It’s important to balance when it’s ok to move fast and hack something together, versus when we need to design for long-term maintainability.