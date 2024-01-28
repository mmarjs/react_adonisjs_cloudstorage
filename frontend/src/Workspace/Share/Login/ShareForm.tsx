import { useState, useEffect, useRef, useContext } from 'react'

/** Data */
import { AppState } from 'App/reducers'
import { useSelector } from 'react-redux'
import { StatusContext } from 'App/StatusProvider'
import { useMutation, useQueryClient } from 'react-query'

/** Material UI */
import makeStyles from '@material-ui/core/styles/makeStyles'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import FormLabel from '@material-ui/core/FormLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import Grow from '@material-ui/core/Grow'
import Popper from '@material-ui/core/Popper'
import Paper from '@material-ui/core/Paper'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import MenuList from '@material-ui/core/MenuList'
import IconButton from '@material-ui/core/IconButton'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'

/** UI */
import { ReactComponent as LinkcopyIcon } from 'Image/icon_copy_link.svg'
import { ReactComponent as RefreshIcon } from 'Image/icon_refresh.svg'

/** Helpers */
import { SecureFormProps, QueryKey } from 'types'
import { useIsMounted, isFieldError, useAxios } from 'Lib'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import dayjs from 'dayjs'
import generator from 'generate-password'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ShareUpdateLinkBody } from '../types'

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
  messageTitle: {
    margin: 'auto',
    width: '80%',
  },
  shareForm: {
    marginTop: '20px',
    padding: '10px',
  },
  shareFormTextField: {
    width: '80%',
  },
  breadText: {
    fontSize: '0.8rem',
  },
  breadcrumbs: {
    margin: 0,
    paddingLeft: '10px',
  },
  formControlLabel: {
    margin: 0,
    width: '100%',
  },
  expirationSelect: {
    'width': '100%',
    '& legend': {
      width: 0,
    },
  },
  expirationTime: {
    float: 'right',
    width: '95%',
  },
  expiresTime: {
    width: '95%',
  },
  groupWrapper: {
    paddingLeft: '5px',
  },
  passwordLabel: {
    background: '#fff',
  },
  passwordForm: {
    width: '100%',
  },
  passwordRefreshIcon: {
    fill: '#5FB158',
    width: '20px',
  },
  wrapIcon: {
    verticalAlign: 'middle',
    display: 'inline-flex',
    padding: '0 24px',
    bottom: '10px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#5FB158',
  },
  LinkCopyIcon: {
    width: '20px',
    marginLeft: '10px',
  },
  copyLinkGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  popperMenu: {
    zIndex: 999,
  },
  saveButton: {
    'width': 'auto',
    'backgroundColor': '#4472C4',
    'height': '30px',
    'paddingLeft': '15px',
    'borderRadius': '20px',
    'textTransform': 'capitalize',
    '&:hover': {
      color: '#000',
    },
  },
  userName: {
    textAlign: 'center',
    color: '#5FB158',
    fontWeight: 'bold',
  },
  passwordFormGroup: {
    'margin': 0,
    'position': 'relative',
    '& .MuiFormHelperText-contained': {
      position: 'absolute',
      bottom: '-16px',
    },
  },
  showPasswordIcon: {
    position: 'absolute',
    width: '50px',
    right: '5px',
    top: '-3px',
  },
  type: {
    display: 'none',
  },
}))

export function ShareForm(props: SecureFormProps) {
  const { openModal, onCloseModal } = props
  const { setSafely } = useIsMounted()
  const classes = useStyles()
  const axios = useAxios()
  const { showStatus } = useContext(StatusContext)
  const queryClient = useQueryClient()
  const [expiration, setExpiration] = useState(4)
  const [expirationDate, setExpirationDate] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [open, setOpen] = useState<boolean>(false)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const shareUpdateData = useSelector((state: AppState) => state.workspaceData.shareUpdateData)
  const randomPassword = generator.generate({
    length: 8,
  })
  const [password, setPassword] = useState(randomPassword)
  useEffect(() => {
    setExpirationDate(shareUpdateData.Expiration)
    if (shareUpdateData.Expiration === null) {
      setExpiration(0)
    } else {
      setExpiration(4)
    }
  }, [shareUpdateData])

  const handleCloseModal = () => {
    onCloseModal()
  }

  const getTitle = (accessType?: string): string => {
    if (accessType) {
      if (accessType === 'Download') {
        return 'Secure Download Request'
      }

      if (accessType === 'Upload') {
        return 'Secure Upload Request'
      }
    }

    return 'Share Link Request'
  }

  const title = getTitle(shareUpdateData.accessType)

  const schema = yup.object().shape({
    password: yup.string().required('A password is required').min(8),
  })

  const { register, control, setValue, handleSubmit, errors } = useForm<any>({
    resolver: yupResolver(schema),
  })

  const onSubmit = (data: any) => {
    let expiresDate: string = ''
    if (data.expires === 1) {
      expiresDate = dayjs(new Date()).add(3, 'day').format('YYYY-MM-DD hh:mm:ss A')
    } else if (data.expires === 2) {
      expiresDate = dayjs(new Date()).add(7, 'day').format('YYYY-MM-DD hh:mm:ss A')
    } else if (data.expires === 3) {
      expiresDate = dayjs(new Date()).add(30, 'day').format('YYYY-MM-DD hh:mm:ss A')
    } else if (data.expires === 4) {
      expiresDate = data.date + ' ' + data.time
    }
    let expiresDateParam: any = ''
    if (data.type !== 'stop') {
      if (data.expires !== 0) {
        expiresDateParam = new Date(expiresDate).toISOString()
      } else {
        expiresDateParam = undefined
      }
    } else {
      expiresDateParam = new Date('2000-01-01 00:00').toISOString()
    }
    const params: ShareUpdateLinkBody = {
      linkId: shareUpdateData.id,
      updateData: {
        expiry: expiresDateParam,
        password: data.password,
        resend: data.type === 'resend' && data.type !== 'stop' ? false : true,
      },
    }
    mutationUpdateShareLink.mutate(params)
  }

  const updateShareLink = async (params: object): Promise<void> => {
    let data: any = []
    data = await axios.put(`/share/update_link/${params['linkId']}`, params['updateData'])
    return data
  }

  const mutationUpdateShareLink = useMutation(updateShareLink, {
    onSuccess: (data) => {
      queryClient.refetchQueries([QueryKey.workspaceShareLink])
      showStatus('A file was successfully updated!')
      setOpen(false)
      onCloseModal()
    },
    onError: () => {
      showStatus('A file could not be updated, please try again', 'error')
      setOpen(false)
      onCloseModal()
    },
  })

  const changeExpiration = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSafely(setExpiration, event.target.value as number)
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleClickShowPassword = () => {
    setSafely(setShowPassword, !showPassword)
  }

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return
    }
    setOpen(false)
  }

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
    }
  }

  const prevOpen = useRef(open)

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus()
    }
    prevOpen.current = open
  }, [open])

  const setRandomPassword = () => {
    const randomPassword = generator.generate({
      length: 8,
    })
    setPassword(randomPassword)
  }

  const handleUpdateShareLink = (mode: 'resend' | 'close' | 'stop') => {
    setValue('type', mode)
    handleSubmit(onSubmit)()
  }

  return (
    <div>
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        maxWidth={'sm'}
      >
        <DialogTitle id="form-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <Typography className={classes.userName}>{shareUpdateData.userName}</Typography>
          <form id="share-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid item className={classes.shareForm}>
              <FormGroup>
                <Grid container alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <FormLabel>Expires on:</FormLabel>
                  </Grid>
                  <Grid container item sm={9} xs={12} className={classes.groupWrapper}>
                    <Controller
                      id="expires"
                      name="expires"
                      label="Expires"
                      control={control}
                      defaultValue={expiration}
                      render={({ onChange, ref }) => (
                        <FormControl
                          variant="outlined"
                          size="small"
                          className={classes.expirationSelect}
                        >
                          <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={expiration}
                            onChange={(event) => {
                              changeExpiration(event)
                              setValue('expires', event.target.value)
                            }}
                          >
                            <MenuItem value={0}>Never</MenuItem>
                            <MenuItem value={1}>3 days</MenuItem>
                            <MenuItem value={2}>7 days</MenuItem>
                            <MenuItem value={3}>30 days</MenuItem>
                            <MenuItem value={4}>Custom</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                    <Controller
                      id="type"
                      name="type"
                      label="type"
                      control={control}
                      defaultValue={expiration}
                      render={({ onChange, ref }) => (
                        <FormControl variant="outlined" size="small" className={classes.type}>
                          sadasdas
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </FormGroup>
              {expiration === 4 && (
                <FormGroup>
                  <Grid container alignItems="center">
                    <Grid item sm={3} xs={12}></Grid>
                    <Grid container item sm={9} xs={12} className={classes.groupWrapper}>
                      <Grid item xs={6}>
                        <TextField
                          id="date"
                          name="date"
                          type="date"
                          inputRef={register}
                          defaultValue={dayjs(new Date(expirationDate)).format('YYYY-MM-DD')}
                          variant="outlined"
                          size="small"
                          className={classes.expiresTime}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          id="time"
                          name="time"
                          type="time"
                          inputRef={register}
                          defaultValue={dayjs(new Date(expirationDate)).format('HH:mm')}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            step: 300, // 5 min
                          }}
                          variant="outlined"
                          size="small"
                          className={classes.expirationTime}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </FormGroup>
              )}
              <FormGroup>
                <Grid container alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <FormLabel>Password</FormLabel>
                  </Grid>
                  <Grid
                    container
                    item
                    sm={9}
                    xs={12}
                    alignItems="center"
                    className={classes.groupWrapper}
                  >
                    <Grid item sm={11}>
                      <FormGroup className={classes.passwordFormGroup}>
                        <TextField
                          id="password"
                          name="password"
                          inputRef={register}
                          type={showPassword ? 'text' : 'password'}
                          defaultValue={password}
                          variant="outlined"
                          size="small"
                          error={isFieldError(errors.password?.message)}
                          helperText={errors.password?.message}
                        />
                        <IconButton
                          className={classes.showPasswordIcon}
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </FormGroup>
                    </Grid>
                    <Grid item sm={1}>
                      <IconButton aria-label="password refresh" onClick={setRandomPassword}>
                        <RefreshIcon className={classes.passwordRefreshIcon} />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
              </FormGroup>
              <FormGroup className={classes.copyLinkGroup}>
                <CopyToClipboard
                  text={password}
                  onCopy={() => showStatus('A link copied to clipboard.')}
                >
                  <Typography variant="subtitle1" className={classes.wrapIcon}>
                    Copy <LinkcopyIcon className={classes.LinkCopyIcon} />
                  </Typography>
                </CopyToClipboard>
              </FormGroup>
              <FormGroup className={classes.saveButtonGroup}>
                <Button
                  ref={anchorRef}
                  aria-controls={open ? 'menu-list-grow' : ''}
                  aria-haspopup="true"
                  className={classes.saveButton}
                  size="small"
                  onClick={() => handleUpdateShareLink('resend')}
                  onMouseLeave={(e) => {
                    setOpen((prevOpen) => !prevOpen)
                  }}
                  onMouseEnter={(e) => {
                    setOpen((prevOpen) => !prevOpen)
                  }}
                >
                  Save & Resend <ArrowDropDownIcon />
                </Button>
                <Popper
                  open={open}
                  anchorEl={anchorRef.current}
                  role={''}
                  transition
                  disablePortal
                  className={classes.popperMenu}
                >
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      style={{
                        transformOrigin: 'center bottom',
                      }}
                    >
                      <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                          <MenuList
                            autoFocusItem={open}
                            id="menu-list-grow"
                            onKeyDown={handleListKeyDown}
                            onMouseEnter={(e) => {
                              setOpen((prevOpen) => !prevOpen)
                            }}
                            onMouseLeave={(e) => {
                              setOpen((prevOpen) => !prevOpen)
                            }}
                          >
                            <MenuItem onClick={() => handleUpdateShareLink('close')}>
                              Save & Close
                            </MenuItem>
                            <MenuItem onClick={() => handleUpdateShareLink('stop')}>
                              Stop Sharing
                            </MenuItem>
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              </FormGroup>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
