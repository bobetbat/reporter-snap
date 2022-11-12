import React, { useState, useEffect } from 'react';
import { Address, Bee, BeeDebug, PostageBatch } from '@ethersphere/bee-js';
import { Button } from './Buttons'
import { IconButton, Stack, TextareaAutosize, Typography } from '@mui/material';
import ThumbDownRoundedIcon from '@mui/icons-material/ThumbDownRounded';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import styled from 'styled-components';

const beeUrl = "http://localhost:1633"
const beeDebugUrl = "http://localhost:1635"
const POSTAGE_STAMPS_AMOUNT = BigInt(10000)
const POSTAGE_STAMPS_DEPTH = 20
const bee = new Bee(beeUrl);
const beeDebug = new BeeDebug(beeDebugUrl);

const CardWrapper = styled.div<{ fullWidth?: boolean; disabled: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : '250px')};
  background-color: ${({ theme }) => theme.colors.card.default};
  margin-top: 2.4rem;
  margin-bottom: 2.4rem;
  padding: 2.4rem;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.default};
  filter: opacity(${({ disabled }) => (disabled ? '.4' : '1')});
  align-self: stretch;
  ${({ theme }) => theme.mediaQueries.small} {
  width: 100%;
    margin-top: 1.2rem;
    margin-bottom: 1.2rem;
    padding: 1.6rem;
  }
`;

export const Form = () => {
  // const [file, setFile] = useState<File | null>(null)
  const [comment, setComment] = useState<string | null>(null)
  const [like, setLike] = useState<boolean | null>(null)

  const [link, setLink] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const [postageStamps, setPostageStamps] = useState<PostageBatch[]>([])
  const [selectedPostageStamp, setSelectedPostageStamp] = useState<Address | null>(null)
  const [loadingStamps, setLoadingStamps] = useState<boolean>(false)
  const [creatingStamp, setCreatingStamp] = useState<boolean>(false)
  const [stampError, setStampError] = useState<Error | null>(null)

  useEffect(() => {
    setLoadingStamps(true)
    beeDebug.getAllPostageBatch()
      .then((ps: PostageBatch[]) => setPostageStamps(ps))
      .catch(setStampError)
      .finally(() => setLoadingStamps(false))
  }, [])

  const createPostageStamp = async () => {
    try {
      setCreatingStamp(true)
      await beeDebug.createPostageBatch(POSTAGE_STAMPS_AMOUNT.toString(), POSTAGE_STAMPS_DEPTH)
      setCreatingStamp(false)

      setLoadingStamps(true)
      const ps = await beeDebug.getAllPostageBatch()
      setPostageStamps(ps)
      setLoadingStamps(false)
    }
    catch (e) {
      setStampError(e)
    }
  }

  const handleSelectPostageStamp = (event: React.ChangeEvent<HTMLInputElement>) => { setSelectedPostageStamp(event.target.value as Address) }

  // should upload json file to storage
  const handleSubmit = async () => {
    // event.preventDefault();

    if (!selectedPostageStamp) return

    let data = {
      like: like,
      contract: null,
      message: '',// signed????
      sign: null // ?????
    }

    if (data.contract !== null && data.sign !== null) {
      try {
        setUploading(true)
        setLink(null)

        const { reference } = await bee.uploadFile(selectedPostageStamp, JSON.stringify(data))
        setLink(`${beeUrl}/bzz/${reference}`)
      } catch (e) {
        setError(e)
      }
      finally {
        setUploading(false)
      }
    }
  }


  const onChange = (event: React.ChangeEventHandler<HTMLTextAreaElement>) => {
    const f = event.target && event.target.value && event.target.value
    setComment(f)
    // setFile(f)
    setError(null)
    setLink(null)
  }

  return (
    <CardWrapper fullWidth disabled={false}>
      {/* <h1>Postage stamps</h1>
      <code>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr 100px',
          rowGap: '5px',
          columnGap: '15px'
        }}>
          <div>Selected</div>
          <div>Batch ID</div>
          <div>Utilization</div>
        </div>
        <hr />
        {postageStamps.map(({ batchID, utilization }) =>
          <div key={batchID} style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr 100px',
            rowGap: '5px',
            columnGap: '15px'
          }}>
            <div><input type="radio" name="stamps" value={batchID} onChange={handleSelectPostageStamp} /></div>
            <div>{batchID}</div>
            <div>{utilization}</div>
          </div>)}
        <hr />
      </code> */}
      {/* <button onClick={createPostageStamp}>Create new postage stamp</button>
      <code>
        {loadingStamps && <span>Loading postage stamps...</span>}
        {creatingStamp && <span>Creating new postage stamp...</span>}
        {stampError && <span>{stampError.message}</span>}
      </code> */}

      <Typography textAlign='center' variant='h3'>Report Contract</Typography>
      <form onSubmit={handleSubmit}>
        <Stack direction='column' spacing={2}>
          <Stack direction='row' justifyContent="space-evenly">
            <IconButton color={like ? "primary" : "inherit"} aria-label="upload picture" component="label" onClick={() => setLike(true)}>
              <ThumbUpRoundedIcon fontSize="large" />
            </IconButton>
            <IconButton color={!like ? "primary" : "inherit"} aria-label="upload picture" component="label" onClick={() => setLike(false)}>
              <ThumbDownRoundedIcon fontSize="large" />
            </IconButton>
          </Stack>

          <TextareaAutosize
            maxRows={4}
            aria-label="maximum height"
            placeholder="...comment"
            style={{ width: 'stretch-content', height: '100px' }}
            onChange={onChange}
          />

          <Button style={{ width: '100%' }} onClick={() => handleSubmit()}>
            Submit
          </Button>
        </Stack>
      </form>
      {/* <code>
        {selectedPostageStamp === null && <span>Please select a postage stamp to use for the file upload</span>}
        {uploading && <span>Uploading...</span>}
        {link && <a href={link} target="blank" >{link}</a>}
        {error && <span>{error.message}</span>}
      </code> */}
    </CardWrapper>
  );
}
