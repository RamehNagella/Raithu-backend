Daily commands you’ll use 🔁

git status
git add .
git commit -m "message"
git pull
git push

Standard & safe workflow (recommended)
1️⃣ Keep main clean

No direct coding

No experiments

Only stable code goes here

2️⃣ Create a development branch

From your project root:

# git checkout -b dev

This means:

Create branch dev

Switch to it immediately

check

# git branch

You’ll see:

- dev
  main
  Now you are safe 😄

3️⃣ Develop ONLY on dev

Do your normal work:

# git status

# git add .

# git commit -m "Add login page UI"

# git commit -m "Integrate API"

Push dev branch:

# git push -u origin dev

Now GitHub has:

main → clean
dev → active development

 <!-- When code is stable → merge to main 🔀 -->

4️⃣ Merge dev → main (locally)

# git checkout main

# git pull origin main

# git merge dev

If everything looks good:

# git push origin main

Even better: feature branches (real-world workflow)

For bigger projects 👇

Branch structure
main → production
dev → integration
feature/\* → actual work

Example:

# git checkout dev

# git checkout -b feature/auth-flow

Work here:

# git commit -m "Add login form"

# git commit -m "Add JWT handling"

Merge back:

# git checkout dev

# git merge feature/auth-flow

# git push origin dev

Later:

dev → main

What NOT to do ❌

❌ Commit directly to main

❌ Push broken code to main

❌ Use main for experiments

How this helps AWS production 🌍

When you deploy:

AWS pulls from main

You are 100% confident it’s stable

No “oops” moments 😅

This is CI/CD-friendly and scalable.

Minimal commands you’ll use daily 🔁

# git checkout dev

# git checkout -b feature/xyz

# git add .

# git commit -m "message"

# git push

# git merge

My recommendation for YOUR new project 🎯

Since you’re starting fresh:

main → production

dev → daily work

Feature branches when needed

Simple. Clean. Professional.

Next, I can help you:

Protect main branch on GitHub (no direct push)

Decide branch naming conventions

Set up CI/CD flow for AWS

Map branches → environments (dev / prod)

Just tell me what’s next 🚀
##

git checkout feature/orders
git push -u origin feature/orders

git checkout dev
git pull origin dev
git merge feature/orders
git push origin dev

git branch -d feature/orders
git push origin --delete feature/orders
