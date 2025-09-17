
CREATE OR REPLACE FUNCTION vote(poll_id uuid, option_id int)
RETURNS void AS $$
BEGIN
  INSERT INTO votes (poll_id, option_index, voter_id)
  VALUES (poll_id, option_id, auth.uid());
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_poll_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE polls
  SET options = (
    SELECT jsonb_agg(
      CASE
        WHEN (elem->>'id')::int = NEW.option_index THEN
          jsonb_set(elem, '{votes}', (elem->>'votes')::int + 1)
        ELSE
          elem
      END
    )
    FROM jsonb_array_elements(options) AS elem
  )
  WHERE id = NEW.poll_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_vote_insert
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_poll_votes();
