# Phase 3: Meal Planning, Sharing & Unit Conversion

## Overview

Phase 3 builds three major features on top of the completed Phase 1/2 foundation:

1. **Meal Planning Calendar** — weekly drag-and-drop planner with 4 meal slots/day
2. **Cookbook Sharing** — JWT-based shareable links with `viewer`/`editor` RBAC roles
3. **Advanced Shopping List** — unit conversion engine + aisle grouping + PDF export

---

## Architecture at a Glance

```
Persona: Backend Architect → Backend Developer → Frontend Developer
```

### New DB Models (Prisma)
| Model | Purpose |
|-------|---------|
| `MealPlan` | Named weekly plan, owned by user |
| `MealPlanEntry` | One recipe → one slot (date + mealType) |
| `CookbookShare` | Share token for a cookbook with role + expiry |

### New API Endpoints
| Method | Path | Permission |
|--------|------|-----------|
| GET/POST/DELETE | `/api/v1/meal-plans` | `mealplan:read/create/delete` |
| GET/PUT | `/api/v1/meal-plans/:id` | owner only |
| POST/DELETE | `/api/v1/meal-plans/:id/entries` | owner only |
| POST | `/api/v1/cookbooks/:id/share` | `cookbook:share` |
| GET | `/api/v1/cookbooks/shared/:token` | public |
| DELETE | `/api/v1/cookbooks/:id/share/:shareId` | owner only |
| POST | `/api/v1/shopping-lists/generate-advanced` | authenticated |
| GET | `/api/v1/shopping-lists/:id/export-pdf` | owner only |

---

## User Review Required

> [!IMPORTANT]
> **Unit Conversion Scope**: The spec requires cross-unit merging (e.g. `200g + 1 cup flour → 440g`). This is ingredient-specific (1 cup flour ≠ 1 cup water). I'll implement a **rule-based converter** with a predefined density table for common ingredients. Edge cases will keep items separate rather than guessing. Agree?

> [!IMPORTANT]
> **PDF Export**: Will use `jsPDF` (browser-side) for zero-dependency PDF generation. This avoids adding Puppeteer to the backend (too heavy for dev). The export button will be on the shopping list detail page.

> [!NOTE]
> **Drag & Drop**: Using `@dnd-kit/core` + `@dnd-kit/sortable` — already in the approved library list (dnd-kit). Needs `npm install @dnd-kit/core @dnd-kit/utilities` in the frontend.

> [!NOTE]
> **Cookbook Sharing Bootstrap**: The `cookbook:share` permission already exists in the seed and is assigned to both `admin` and `user` roles.

> [!WARNING]
> **New Prisma migration needed**: Will add 3 new models + 2 new permissions to seed. Migration will be generated and applied in-place.

---

## Open Questions

> [!IMPORTANT]
> **Meal Plan Scope**: Should a meal plan be tied to a specific week (e.g. `week_start` date), or can it be any named arbitrary collection of recipe-day-slot assignments? The scope doc says "weekly calendar view" — I'll implement with a `weekStart` date field (Monday-anchored).

---

## Proposed Changes

### 1. Database Layer

#### [MODIFY] `prisma/schema.prisma`
Add 3 new models and 2 new permissions to seed:

```prisma
model MealPlan {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  weekStart DateTime @map("week_start") @db.Date
  userId    String   @map("user_id") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  user    User            @relation(fields: [userId], references: [id])
  entries MealPlanEntry[]

  @@map("meal_plans")
}

model MealPlanEntry {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  mealPlanId String   @map("meal_plan_id") @db.Uuid
  recipeId   String   @map("recipe_id") @db.Uuid
  date       DateTime @db.Date
  mealType   String   @map("meal_type") // Breakfast | Lunch | Dinner | Snacks
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz()

  mealPlan MealPlan @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
  recipe   Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@map("meal_plan_entries")
}

model CookbookShare {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  cookbookId  String    @map("cookbook_id") @db.Uuid
  shareToken  String    @unique @map("share_token")
  role        String    // viewer | editor
  viewCount   Int       @default(0) @map("view_count")
  expiresAt   DateTime? @map("expires_at") @db.Timestamptz()
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz()

  cookbook Cookbook @relation(fields: [cookbookId], references: [id], onDelete: Cascade)

  @@map("cookbook_shares")
}
```

Also add `Recipe` relation to `MealPlanEntry` (add `mealPlanEntries MealPlanEntry[]` to `Recipe` model).
Add `CookbookShare[]` to `Cookbook` model.
Add `MealPlan[]` to `User` model.

#### [MODIFY] `prisma/seed.ts`
Add new permissions:
- `mealplan:create`, `mealplan:read`, `mealplan:delete`
- Assign to `admin` and `user` roles

---

### 2. Backend – Meal Planner

#### [NEW] `src/services/MealPlanService.ts`
- `createMealPlan(userId, name, weekStart)` → create plan
- `getMealPlan(id, userId)` → get plan + entries + recipes (ownership check)
- `listMealPlans(userId)` → all plans for user
- `addEntry(mealPlanId, recipeId, date, mealType, userId)` → add recipe to slot
- `removeEntry(entryId, userId)` → remove recipe from slot
- `deleteMealPlan(id, userId)` → delete plan
- `generateShoppingListFromPlan(mealPlanId, userId)` → calls enhanced ShoppingListService

#### [NEW] `src/controllers/MealPlanController.ts`
- Standard class pattern with Zod validation
- Ownership enforcement (user can only access their own plans)

#### [NEW] `src/routes/mealPlanRoutes.ts`
```
GET    /api/v1/meal-plans              → list user plans
POST   /api/v1/meal-plans              → create plan
GET    /api/v1/meal-plans/:id          → get plan with entries
PUT    /api/v1/meal-plans/:id          → update plan name/week
DELETE /api/v1/meal-plans/:id          → delete plan
POST   /api/v1/meal-plans/:id/entries  → add entry to plan
DELETE /api/v1/meal-plans/:id/entries/:entryId → remove entry
POST   /api/v1/meal-plans/:id/shopping-list    → generate list from week
```

---

### 3. Backend – Cookbook Sharing

#### [NEW] `src/services/CookbookShareService.ts`
- `createShare(cookbookId, userId, role, expiresInDays?)` → generate JWT share token, store in DB
- `getShareByToken(token)` → validate token, increment viewCount, return cookbook
- `listShares(cookbookId, userId)` → list all share links for a cookbook
- `revokeShare(shareId, userId)` → delete share record

Share token format: signed JWT with `{ cookbookId, shareId, role }` — secret from `JWT_SECRET`.

#### [NEW] `src/controllers/CookbookShareController.ts`

#### [MODIFY] `src/routes/cookbookRoutes.ts`
Add:
```
POST   /api/v1/cookbooks/:id/shares         → create share (authenticate + cookbook:share)
GET    /api/v1/cookbooks/:id/shares         → list shares (authenticate + owner)
DELETE /api/v1/cookbooks/:id/shares/:shareId → revoke (authenticate + owner)
GET    /api/v1/cookbooks/shared/:token      → public access via token
```

---

### 4. Backend – Advanced Shopping List (Unit Conversion)

#### [NEW] `src/utils/unitConverter.ts`
- Conversion map (g ↔ kg ↔ cup ↔ ml ↔ l ↔ tsp ↔ tbsp)
- Density table for common ingredients (flour, sugar, butter, milk, oil, rice, oats)
- `convertToBase(qty, unit, ingredientName)` → normalized quantity in grams (weight) or ml (volume)
- `mergeIngredients(ingredients[])` → groups by name, converts to common unit, returns merged list

#### [MODIFY] `src/services/ShoppingListService.ts`
- Add `generateAdvanced(recipeIds, userId, listName)` → uses `unitConverter` for cross-unit merging
- Add `getAisleGroup(ingredientName)` → categorizes into: Produce, Dairy, Meat, Pantry, Spices, Other
- Enhance existing `generateFromRecipes` to use unit conversion

#### [MODIFY] `src/routes/shoppingListRoutes.ts`
Add:
```
POST /api/v1/shopping-lists/generate-advanced → generate with unit conversion
```

---

### 5. Frontend – New Pages & Components

#### [NEW] `src/app/meal-planner/page.tsx`
Weekly calendar grid with `@dnd-kit`:
- 7 columns (Mon–Sun), 4 rows (Breakfast/Lunch/Dinner/Snacks)
- Week navigator (prev/next week buttons)
- Recipe cards drag from sidebar library → drop into slots
- "Generate Shopping List" button at bottom
- Save plan on drop (immediate API call)
- Skeleton loading per-cell

#### [NEW] `src/services/mealPlanService.ts`
Axios calls for all meal plan endpoints.

#### [NEW] `src/app/cookbooks/[id]/page.tsx` (or enhance existing)
Add "Share" button → opens Share Modal:
- Role dropdown (Viewer / Editor)
- Expiry options (7 days / 30 days / Never)
- List of existing share links with revoke button
- Copy-to-clipboard for share URL

#### [MODIFY] `src/app/shopping-list/[id]/page.tsx`
Add:
- "Export PDF" button → uses `jsPDF` to generate formatted list
- Aisle grouping toggle (group items by category)
- Unit conversion badge showing "converted from X"

#### [MODIFY] `src/components/shared/Sidebar.tsx`
Add "Meal Planner" nav item with Calendar icon.

---

## Dependencies to Install

### Backend
None new — existing packages sufficient.

### Frontend
```bash
npm install @dnd-kit/core @dnd-kit/utilities @dnd-kit/sortable jspdf
```

---

## Prisma Migration Plan
```bash
# 1. Add models to schema
# 2. Generate migration
npx prisma migrate dev --name add_meal_plans_sharing
# 3. Re-run seed (idempotent)
npx ts-node prisma/seed.ts
```

---

## Verification Plan

### Backend
1. `npx prisma migrate dev` completes cleanly
2. Seed runs without errors
3. Test meal plan create → add entry → generate shopping list flow
4. Test share token generation → public access via token
5. Test unit conversion: `200g + 1 cup` flour merges to `~440g`

### Frontend
1. Navigate to `/meal-planner` — calendar renders
2. Drag a recipe from library → drops into Monday Breakfast slot
3. Click "Generate Shopping List" → redirects to new list with converted units
4. Open cookbook → Share button → generate link → access link in incognito
5. Shopping list PDF export opens download

---

## Implementation Order

**Backend first, then frontend:**

1. `[ ]` Prisma schema additions (MealPlan, MealPlanEntry, CookbookShare)
2. `[ ]` Run migration + update seed
3. `[ ]` `unitConverter.ts` utility
4. `[ ]` `MealPlanService.ts` + `MealPlanController.ts` + `mealPlanRoutes.ts`
5. `[ ]` `CookbookShareService.ts` + `CookbookShareController.ts` + update `cookbookRoutes.ts`
6. `[ ]` Update `ShoppingListService.ts` with advanced generation
7. `[ ]` Register new routes in `app.ts`
8. `[ ]` Install frontend deps (`@dnd-kit`, `jspdf`)
9. `[ ]` `mealPlanService.ts` (frontend)
10. `[ ]` `/meal-planner/page.tsx` (calendar + DnD)
11. `[ ]` Cookbook share modal in cookbook detail page
12. `[ ]` Shopping list detail page PDF export + aisle grouping
13. `[ ]` Sidebar nav update
