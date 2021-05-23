<form method="POST" action="/faves/<%=eachNote.dataValues.id %>?_method=PUT">
      <input type="text" name="update" id="update">
      <button class="btn btn-success">Update</button>
    </form>

    <div>
  <form action="/notes" method="POST">
    <input type="text" name="note" id="note" />
    <input type="hidden" name="drinkId" value="<%= fave.dataValues.id %>" />
  </form>
  <form method="POST" action="/faves/<%=fave.dataValues.id %>?_method=DELETE">
    <button class="btn btn-danger">Delete</button>
  </form>
</div>