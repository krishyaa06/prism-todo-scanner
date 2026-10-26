from fastapi import FastAPI
app = FastAPI()
# TODO: move CORS origins to env
# XXX this endpoint has no auth
@app.get("/admin")
def admin(): return {"ok": True}
